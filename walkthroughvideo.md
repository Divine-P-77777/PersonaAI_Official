# 🎥 Capstone Video Demo: Mentor Creation Dummy Data

Use this data to smoothly copy-paste during your video demonstration when creating a new AI Mentor. This creates a highly professional, realistic persona that will look great on the Explore page!

---

## 1. Core Identity
* **Name:** Alex Chen - Staff Engineer
* **Description:** Ex-Google Staff Engineer helping you crack system design interviews, scale your backend architectures, and negotiate top-tier tech offers.

## 2. AI Personality
* **Custom Greeting:** Hey there! I'm Alex. Whether you're struggling with a tricky system design interview or need help scaling your cloud architecture, I'm here to guide you. What are we tackling today?
* **Tone of Voice:** Direct
* **Voice Gender:** Male
* **Focus Areas (CSV):** System Design, Microservices, AWS Architecture, Technical Interviews, Career Growth, Salary Negotiation, Backend Development

## 3. Monetization / Pricing Config
* **Tier Selection:** Paid Mentor -> **Standard Tier**
* **Unlock Price:** ₹1,500
* **Credits per Unlock:** 40 credits
* **Voice Responses:** Enabled

## 4. Knowledge Base (Data Sources)
*When you get to the ingestion step, you can paste the following text as a "Raw Text" data source to train the mentor on their specific methodology.*

**Title:** Alex's System Design Framework
**Content:**
```text
The "Alex Chen" System Design Framework (AC-SDF) consists of 4 main pillars when answering any system design interview question:
1. Clarify Requirements (Functional & Non-Functional): Always ask about DAU (Daily Active Users), Read/Write ratio, and latency requirements before drawing any boxes.
2. High-Level Design: Start with the API Gateway, Load Balancers, and monolithic services before breaking them down into microservices.
3. Database Schema & Storage: Choose between SQL (ACID compliance, financial data) vs NoSQL (eventual consistency, high scale, social media feeds). Mention caching layers like Redis or Memcached.
4. Bottlenecks & Scaling: Discuss horizontal scaling, sharding, replication, and rate limiting to prevent abuse.

When students ask for career advice, emphasize the importance of "Impact". At the Staff level, it's not just about writing code; it's about leading cross-functional teams and designing systems that save the company money or open new revenue streams.
```

---

### 💡 Video Recording Tips:
* **Pacing:** Have this file open on a second monitor or split-screen so you can quickly copy-paste without typing long sentences on camera.
* **Highlighting:** When showing the Profile Modal, hover over the skills you pasted in step 2 to show how the UI dynamically formats them into neat tags.
* **Voice Demo:** During the chat demonstration, make sure to click the "Voice" toggle so the judges can hear Alex's male voice reading out the system design advice!

---

## 5. PDF Generation Prompt (Knowledge Base Expansion)
*If you plan to use an AI tool (like ChatGPT or Claude) to generate a realistic PDF document to upload as a file source for your mentor during the video, use the prompt below:*

**Prompt to generate the PDF content:**
```text
Act as a Staff Software Engineer at a FAANG company. I am creating a "Knowledge Base" document for an AI Mentor platform. I need you to generate a detailed, 2-page guide titled "The Ultimate SDE & Backend Placement Roadmap". 

Please include the following sections, formatted clearly with bullet points and bold text:
1. **The Core Foundation:** A brief roadmap on mastering Data Structures & Algorithms (Arrays, Trees, Graphs, DP) and why it's critical for initial screening rounds.
2. **Backend & Systems Engineering:** A checklist of must-know backend concepts (REST APIs, Microservices, Authentication/JWT, Message Queues like Kafka/RabbitMQ).
3. **Database Mastery:** SQL vs NoSQL, Indexing, and Caching strategies (Redis).
4. **The System Design Interview:** A 5-step framework for tackling any system design question (Clarify requirements, High-level design, Deep dive into components, Bottlenecks, and Scaling).
5. **Behavioral & HR Prep:** The STAR method (Situation, Task, Action, Result) for answering behavioral questions, and tips on salary negotiation for entry-level vs mid-level SDE (SB) roles.

Keep the tone authoritative, direct, and highly actionable. Do not include introductory fluff; dive straight into the technical roadmaps and placement guidance.
```
*(After generating this content, save it as a PDF named `SDE_Placement_Roadmap.pdf` and upload it during the "Data Sources" step of your video demonstration!)*

---

## 6. PDF Generation Prompt 2 (Recent Trends & Best Practices)
*Use this second prompt to generate an entirely separate PDF. This adds depth to your mentor's knowledge base by training it on modern industry trends and common pitfalls.*

**Prompt to generate the second PDF content:**
```text
Act as a Principal Software Engineer at a top-tier tech company. I am creating a "Knowledge Base" document for an AI Mentor platform. I need you to generate a detailed, 2-page guide titled "2024/2025 SDE Trends: The Dos and Don'ts for Modern Backend Engineers". 

Please include the following sections, formatted clearly with bullet points and bold text:
1. **The Shift in Recent Trends:** Explain the current industry shift towards AI-Assisted Engineering (GitHub Copilot, Cursor), Serverless Architectures, and high-performance languages (Rust, Go) taking over traditional Node.js/Java monoliths.
2. **What You SHOULD Do (The Dos):** 
   - DO master at least one major Cloud Provider (AWS/GCP/Azure) and Infrastructure as Code (Terraform).
   - DO embrace AI coding assistants to increase velocity, but always review the generated code for security flaws.
   - DO focus on system observability (Prometheus, Grafana, OpenTelemetry) rather than just writing application logic.
3. **What You SHOULD NOT Do (The Don'ts):**
   - DON'T over-engineer systems. Avoid microservices for a side project that only has 10 users; start with a majestic monolith.
   - DON'T ignore security. Never hardcode API keys, and don't blindly trust user input without sanitization.
   - DON'T chase every shiny new framework; stick to proven, boring tech (like PostgreSQL) for core business logic.
4. **The "T-Shaped" Engineer:** A brief concluding section on why companies are hiring engineers with deep backend knowledge but broad understanding of frontend, CI/CD, and deployments.

Keep the tone highly opinionated, modern, and engaging. Avoid generic advice; give specific, hard-hitting industry truths.
```
*(After generating this content, save it as a PDF named `Modern_SDE_Trends_Dos_And_Donts.pdf` and upload it alongside the first PDF during your video demonstration!)*

---

## 7. 🎬 The Student Walkthrough (Video Recording Script)
*Once you've created the **Alex Chen** mentor and uploaded the PDFs, switch to a Student Account and follow this script to show off the frontend UI and chat capabilities.*

### Step 1: The Explore Page & Profile UI
* **Action:** Log in as a Student and navigate to the **Explore Personas** page.
* **Demonstrate:** Scroll down to find the "Alex Chen" card. 
* **Talk Track:** *"Here on the Explore page, students can browse mentors. Let's look at Alex Chen, a Staff Engineer we just created."*
* **Action:** Click **View Profile**.
* **Demonstrate:** Scroll up and down inside the Profile Modal. Point out how the **Skills tags** neatly wrap and truncate (thanks to our recent UI fixes), and show how the **`X` close button** stays perfectly fixed in the top right corner while the rest of the modal scrolls.

### Step 2: The Unlock Flow
* **Action:** Click the lock icon (or chat button) to trigger the **Unlock Modal**.
* **Talk Track:** *"Since this is our first interaction, we get a breakdown of the Free Credits allowance. Alex offers 40 free credits for initial exploration."*
* **Action:** Click **Unlock for Free** and wait for the redirect to the Chat Interface.

### Step 3: The Live Chat & RAG Capabilities
* **Action:** In the chat interface, type the following prompt:
  > *"Hi Alex, I have an upcoming system design interview for a backend role. What is your 4-step framework for tackling these questions?"*
* **Talk Track:** *"I'm going to ask Alex a specific question based on the Knowledge Base PDFs we uploaded earlier. Watch how the RAG (Retrieval-Augmented Generation) system pulls the exact 4-step framework from our documents."*
* **Demonstrate:** Let the AI stream the response. Highlight the accuracy of the answer compared to the PDF you generated.

### Step 4: The Voice Integration (Crucial)
* **Action:** Look at the top right of the chat interface and toggle **Voice Enabled** ON.
* **Talk Track:** *"To make the mentorship more immersive, we've integrated Text-to-Speech. Let's hear Alex's advice."*
* **Action:** Type a follow-up question:
  > *"What's the biggest mistake entry-level engineers make when designing microservices?"*
* **Demonstrate:** Turn up your desktop audio so the screen recorder catches the AI's male voice reading the response out loud. Mention that this costs slightly more credits per turn, showcasing the dynamic credit deduction in the top right corner!
