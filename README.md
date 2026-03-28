# Neurofin – AI Money Mentor
**An Agentic AI Financial Co-Pilot for India**

Neurofin is an AI-powered personal finance mentor designed to make financial planning as accessible, intelligent, and personalized as everyday digital conversation. It helps users move from confused savers to confident investors through goal-based planning, money health analysis, tax optimization, and AI-guided financial decisions.

Built as a response to the growing need for accessible financial planning in India, Neurofin aims to bridge the gap between financial information and financial action.

---

## 🛑 Problem Statement

- Over 95% of Indians do not have a structured financial plan.
- Traditional financial advisors often cost ₹25,000+ annually, making personalized advice inaccessible for most salaried and middle-income individuals.

As a result, many users struggle with:
- No clear savings or investment roadmap
- Poor emergency preparedness
- Underutilized tax-saving opportunities
- Lack of retirement planning
- Confusion around SIPs, mutual funds, insurance, and goals
- Financial decisions driven by guesswork instead of strategy

**Neurofin solves this by acting as a 24/7 AI Money Mentor.**

---

## 💡 Solution

Neurofin is an agentic AI financial co-pilot that gives users a personalized financial planning experience based on their income, expenses, savings, goals, and life events. 

Instead of just showing numbers, Neurofin explains:
1. **Where you stand financially**
2. **What you should do next**
3. **Why it matters**
4. **How to improve month by month**

It transforms financial planning from a complex expert-only service into an intuitive, AI-guided experience.

---

## 🌟 Core Features

### 1. Money Health Score
A 5-minute onboarding flow that evaluates the user’s financial wellness across key dimensions:
- Emergency preparedness
- Insurance coverage
- Debt health
- Investment diversification
- Tax efficiency
- Retirement readiness

📌 **Output:** A personalized financial wellness score with actionable recommendations.

### 2. Goal-Based Financial Roadmap
Users enter their Age, Income, Expenses, Existing savings/investments, and Financial goals. Neurofin then generates a roadmap that includes:
- Recommended SIP amounts
- Goal timelines
- Emergency fund targets
- Asset allocation suggestions
- Financial milestones

📌 **Output:** A personalized path toward short-term and long-term goals.

### 3. Life Event Financial Advisor
Neurofin helps users make smarter money decisions during major life events such as Salary bonuses, Marriage, New jobs, Emergency expenses, Buying a vehicle, or Family responsibilities.

📌 **Output:** Personalized AI-driven financial suggestions based on the event and the user’s financial profile.

### 4. Tax Optimization Assistant
Helps users identify missed tax-saving opportunities and make smarter tax decisions.
- Old vs New Tax Regime comparison
- Tax-saving recommendations & Deduction guidance
- Financial planning aligned with tax efficiency

📌 **Output:** Smarter annual tax planning with reduced confusion.

### 5. Conversational AI Financial Mentor
The system acts like a natural AI money coach instead of a static calculator.
- *“Can I afford a ₹15,000 SIP?”*
- *“What should I do with my ₹2 lakh bonus?”*
- *“How much emergency fund do I need?”*
- *“Am I on track for retirement?”*

📌 **Output:** Simple, explainable, and contextual financial guidance.

---

## ⚙️ How It Works

1. **User Flow**: User completes onboarding.
2. **Financial profile is generated**.
3. **AI agents analyze**: savings behavior, investment readiness, debt exposure, tax efficiency, and financial goals.
4. **Neurofin returns**: Money Health Score, personalized recommendations, goal roadmap, and event-based suggestions.

---

## 🚀 Why Neurofin Stands Out

Unlike a generic finance chatbot or simple expense tracker, Neurofin is designed as an **AI decision support system**.

- **Personalized financial intelligence**
- **Indian financial context**
- **Goal-based planning**
- **Explainable AI guidance**
- **Event-driven recommendations**
- **Scalable and affordable for mass users**

It is not just a tool for tracking money — it is a system for improving money decisions.

---

## 🛠️ Tech Stack

**Frontend**
- React / Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion

**Backend**
- Node.js / Express
- APIs for financial calculations and AI orchestration

**AI / Intelligence Layer**
- Agent-based financial reasoning
- Prompt workflows for financial planning
- Personalized recommendation engine
- Goal and event-based advisory logic

**Cloud / Deployment**
- AWS Cloud infrastructure (AWS Cognito, SES, SSM)
- Scalable backend deployment
- Secure user data workflows

**Integrations**
- Razorpay for payments
- Setu Account Aggregator

---

## 🧑‍💻 Use Cases

Neurofin can be used by:
- Young salaried professionals
- First-time investors
- Middle-income households
- Working couples
- Users planning for retirement
- Individuals needing tax and financial guidance

---

## 💼 Business Impact

Neurofin is designed to create measurable value at scale.

**Estimated Annual Impact (Per 1 Lakh Users)**

| Impact Area | Estimated Value |
|-------------|-----------------|
| Cost Savings | ₹240 crore |
| Time Saved | 10 lakh hours |
| Wealth Created | ₹36 crore |
| Tax Savings Recovered | ₹150 crore |
| Financial Risk Avoided | ₹50 crore |
| **Total Estimated Annual Economic Impact** | **₹476+ crore/year** |

*Assumptions*: These estimates are based on reduction in traditional advisor cost, time saved in financial planning, better investment allocation, improved tax optimization, and reduced emergency-driven debt.

---

## 🔮 Vision & Future Scope

Neurofin’s long-term vision is to become **India’s AI Money Mentor for everyday earners**.
A platform where users don’t just consume financial content — they receive personalized financial action plans. The goal is to make financial planning affordable, explainable, accessible, intelligent, and habit-forming.

**Planned future enhancements include:**
- Mutual Fund Portfolio X-Ray
- CAMS / KFintech statement parsing
- XIRR analysis & Portfolio overlap detection
- Couple’s Money Planner
- Insurance gap analysis
- Retirement simulator
- AI-powered monthly wealth review dashboard

---

## 💻 Setup Instructions (Local Development)

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/en) (v18 or higher recommended)
- `npm` (comes with Node.js)
- A running MongoDB cluster (e.g., MongoDB Atlas) or a local MongoDB instance

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary backend dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root of the `backend` directory and add the following keys. Replace the placeholder values with your actual credentials.
   ```env
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret-key
   
   # Setu Account Aggregator
   SETU_BASE_URL=https://fiu-sandbox.setu.co
   SETU_CLIENT_ID=your-setu-client-id
   SETU_CLIENT_SECRET=your-setu-client-secret
   SETU_PRODUCT_INSTANCE_ID=your-setu-product-instance-id
   SETU_REDIRECT_URL=http://your-ngrok-or-localhost-url/setu/callback
   SETU_TEST_MOBILE=your-setu-test-mobile-number
   SETU_AA_HANDLE=onemoney
   
   # AWS Cognito
   COGNITO_USER_POOL_ID=your-cognito-user-pool-id
   COGNITO_CLIENT_ID=your-cognito-client-id
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate back to the project root directory:
   ```bash
   cd ..
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `src` directory (i.e. `./src/.env`), and add the following keys:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_COGNITO_USER_POOL_ID=your-cognito-user-pool-id
   VITE_COGNITO_CLIENT_ID=your-cognito-client-id
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- **Frontend:**
  - `npm run dev`: Starts the Vite development server.
  - `npm run build`: Builds the application for production.
- **Backend (`/backend`):**
  - `npm run dev`: Starts standard node development server.
  - `npm start`: Starts the compiled server with standard `node`.

---

## 🏆 Acknowledgment

This project aligns strongly with the challenge of building an AI-powered personal finance mentor that lives inside everyday digital experiences and makes financial planning accessible at scale. It draws inspiration from the broader idea of an agentic AI financial co-pilot, as explored in the AWS Builder ecosystem. 

---

## 📜 License

This project is private and intended for demonstration/internal usage only.