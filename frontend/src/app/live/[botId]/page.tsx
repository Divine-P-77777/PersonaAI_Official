"use client"
import { useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Mic, MicOff, X } from 'lucide-react';
import Image from "next/image"

const LivePage = () => {
  const params = useParams();
  console.log(`${params.botId}`)

  const [isMute, setIsMute] = useState(false);
  const router = useRouter()
  const handleExit = () => {
    if (confirm("Are you sure to exit")) {
      router.push("/")
    }

  }
  return (
    <div className="min-h-screen py-20 bg-orange-50 ">

      <div className="flex flex-col gap-45 sm:gap-40 items-center ">

        <div className="flex-col items-center justify-center">
          <div className="w-[200px] border-5 border-orange-600 rounded-full h-[200px] sm:w-[150px] sm:h-[150px] overflow-hidden ">

            <Image
              src="/logo.png"
              width={180}
              height={180}
              alt="Picture of the author"
              className="p-2"
            />


          </div>

          <div className="text-black justify-center items-center">
            <div>Mentor name</div>
          </div>
        </div>



        <div className="w-[250px] border border-black  h-[100px] sm:w-[400px] sm:h-[100px] flex justify-center gap-20 items-center text-black">
          {isMute ?
            <div onClick={() => setIsMute(!isMute)} className="p-4 rounded-2xl bg-black"><Mic color="orange" /></div>
            :
            <div onClick={() => setIsMute(!isMute)} className="p-4 rounded-2xl bg-black"><MicOff color="orange" /></div>
          }
          <div onClick={() => handleExit()} className="p-4 rounded-2xl bg-red-500"><X color="white" /></div>

        </div>

      </div>



    </div>
  )
}

export default LivePage
