import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

const SANDBOX_MOBILE_NUMBER = "8828095695";
const BACKEND_BASE_URL = "http://localhost:5000";
const SETU_REDIRECT_URL =
  "https://unrouged-merle-sprier.ngrok-free.dev/setu/callback";

const SmartAccounts = ({ netWorth }) => {
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // 🔥 NEW STATE
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // =====================
  // 🔥 FETCH ACCOUNTS FROM BACKEND
  // =====================
  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/setu/accounts`);
        const data = await res.json();

        console.log("🔥 Accounts from backend:", data);

        if (data.success && data.data.length > 0) {
          const formatted = data.data.map((acc, index) => ({
            id: acc._id,
            name: `Account ${index + 1}`,
            type: "Bank Account",
            balance: acc.totalBalance || 0,
            change: 0,
            color: "#60a5fa",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
          }));

          setAccounts(formatted);
        }
      } catch (err) {
        console.error("❌ Failed to load accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    }

    loadAccounts();
  }, []);

  const formatCurrency = (amount) => {
    if (!balancesVisible) return "••••••";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  // =====================
  // CONNECT BANK
  // =====================
  const connectBank = async () => {
    try {
      setIsConnecting(true);

      const payload = {
        mobileNumber: SANDBOX_MOBILE_NUMBER,
        redirectUrl: SETU_REDIRECT_URL,
      };

      const res = await fetch(`${BACKEND_BASE_URL}/setu/consent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      throw new Error("No redirect URL");
    } catch (error) {
      console.error("❌ Error:", error);
      alert(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-white">Smart Accounts</h3>

        <button onClick={() => setBalancesVisible(!balancesVisible)}>
          {balancesVisible ? <Eye /> : <EyeOff />}
        </button>
      </div>

      <div className="space-y-3">
        {loadingAccounts ? (
          <p className="text-zinc-400">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400 mb-2">No bank connected yet</p>

            <button
              onClick={connectBank}
              disabled={isConnecting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {isConnecting ? "Connecting..." : "Connect Bank"}
            </button>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
            >
              <p className="text-white">{account.name}</p>
              <p className="text-zinc-400 text-sm">{account.type}</p>
              <p className="text-white font-semibold">
                {formatCurrency(account.balance)}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default SmartAccounts;