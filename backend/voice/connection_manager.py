from __future__ import annotations

import asyncio
import contextlib
import logging
from dataclasses import dataclass, field
from fastapi import WebSocket

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class SessionState:
    """
    Holds all runtime state for a websocket session.

    slots=True:
        Reduces memory usage significantly for large numbers of connections.
    """

    websocket: WebSocket
    cancel_event: asyncio.Event = field(default_factory=asyncio.Event)
    active_task: asyncio.Task | None = None


# Connection Manager

class ConnectionManager:

    def __init__(self) -> None:
        # session_id → SessionState
        self._sessions: dict[str, SessionState] = {}

 # Connection lifecycle
 
    async def connect(self, websocket: WebSocket, session_id: str) -> None:
        """
        Accept and register websocket connection.
        """

        await websocket.accept()

        self._sessions[session_id] = SessionState(
            websocket=websocket
        )

        logger.debug("[WS] Connected session=%s total=%d", session_id[:8], len(self._sessions))

    async def disconnect(self, session_id: str) -> None:
        """
        Cleanup session safely.
        """

        session = self._sessions.pop(session_id, None)

        if not session:
            return

        # Cancel active task
        task = session.active_task

        if task and not task.done():
            task.cancel()

            with contextlib.suppress(asyncio.CancelledError):
                await task

        # Close websocket safely
        with contextlib.suppress(Exception):
            await session.websocket.close()

        logger.debug(
            "[WS] Disconnected session=%s total=%d",
            session_id[:8],
            len(self._sessions),
        )

    def is_connected(self, session_id: str) -> bool:
        return session_id in self._sessions


    async def send_json(self,session_id: str,payload: dict,) -> bool:
        """
        Send JSON payload safely.

        Returns:
            True  -> success
            False -> disconnected / failed
        """

        session = self._sessions.get(session_id)

        if not session:
            return False

        try:
            await session.websocket.send_json(payload)
            return True

        except Exception as exc:
            logger.warning(
                "[WS] Send failed session=%s error=%s",
                session_id[:8],
                exc,
            )

            await self.disconnect(session_id)
            return False

    def set_cancel(self, session_id: str) -> None:
        """
        Interrupt current streaming response.
        """

        session = self._sessions.get(session_id)

        if session:
            session.cancel_event.set()

    def clear_cancel(self, session_id: str) -> None:
        """
        Reset interruption flag before new turn.
        """

        session = self._sessions.get(session_id)

        if session:
            session.cancel_event.clear()

    def is_cancelled(self, session_id: str) -> bool:
        """
        Check whether interruption requested.
        """

        session = self._sessions.get(session_id)

        return (
            session.cancel_event.is_set()  #
            if session
            else False
        )


    def register_task(
        self,
        session_id: str,
        task: asyncio.Task,
    ) -> None:
        """
        Register active coroutine for cancellation.
        """

        session = self._sessions.get(session_id)

        if session:
            session.active_task = task

    def cancel_active_task(self, session_id: str) -> None:
        """
        Hard-cancel active coroutine immediately.
        """

        session = self._sessions.get(session_id)

        if not session:
            return

        task = session.active_task

        if task and not task.done():
            task.cancel()

            logger.debug(
                "[WS] Task cancelled session=%s",
                session_id[:8],
            )


    @property
    def total_connections(self) -> int:
        return len(self._sessions)


# Singleton
manager = ConnectionManager()