import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { PaymentFollowUp, Invoice } from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  ClockAlert, 
  IndianRupee, 
  Search, 
  Phone, 
  CheckCircle2, 
  X, 
  Calendar, 
  ArrowRight,
  CreditCard
} from 'lucide-react';

export const FrontDeskPaymentFollowUpsPage: React.FC = () => {
  const [followUps, setFollowUps] = useState<PaymentFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  // Clear Payment Modal
  const [selectedPf, setSelectedPf] = useState<PaymentFollowUp | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer'>('upi');
  const [txnRef, setTxnRef] = useState('');
  const [remarks, setRemarks] = useState('');

  const loadData = () => {
    setIsLoading(true);
    api.getPaymentFollowUps()
      .then(res => setFollowUps(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPf) return;

    try {
      await api.createPayment({
        invoiceId: selectedPf.invoiceId,
        invoiceNumber: selectedPf.invoiceNumber,
        customerId: selectedPf.customerId,
        customerName: selectedPf.customerName,
        amountReceived: Number(payAmount),
        paymentMethod: payMethod,
        paymentDate: new Date().toISOString(),
        transactionRef: txnRef,
        recordedBy: 'Sneha Rao (Front Desk)',
        remarks: remarks || 'Postponed payment cleared'
      });

      setSelectedPf(null);
      loadData();
      alert('Postponed balance cleared and recorded on ledger!');
    } catch (err: any) {
      alert(err.message || 'Failed to clear payment.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#252923]">Payment Postponements & Follow-ups</h1>
        <p className="text-xs text-[#777A70]">Track outstanding deferred balances, promised payment dates, and settlement transactions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Expected Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4">Postponement Reason</th>
                <th className="py-3 px-4">Desk Owner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">Loading payment follow-ups...</td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">No payment postponements in queue.</td>
                </tr>
              ) : (
                followUps.map(pf => (
                  <tr key={pf.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-amber-900 tabular-nums">
                      {pf.expectedPaymentDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#252923] block">{pf.customerName}</span>
                      <a href={`tel:${pf.customerPhone}`} className="text-[11px] text-[#1E3B2E] hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{pf.customerPhone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1E3B2E]">
                      {pf.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-700 tabular-nums">
                      ₹{pf.remainingBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-[#585B53] max-w-xs">
                      <p className="font-medium">“{pf.postponementReason}”</p>
                      {pf.remarks && <p className="text-[11px] text-[#777A70]">{pf.remarks}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-[#777A70]">{pf.assignedFollowUpOwner}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPf(pf);
                          setPayAmount(pf.remainingBalance);
                        }}
                        className="px-2.5 py-1 bg-[#1E3B2E] text-white rounded text-[11px] font-semibold hover:bg-[#2A5140] transition-colors"
                      >
                        Collect Balance
                      </button>
                      <button
                        onClick={() => setActive360CustomerId(pf.customerId)}
                        className="px-2 py-1 text-[#1E3B2E] hover:bg-[#F0EEE5] rounded text-[11px] font-semibold"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SETTLE POSTPONED BALANCE */}
      {selectedPf && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Clear Postponed Balance</h3>
                <p className="text-xs text-[#777A70]">{selectedPf.customerName} · {selectedPf.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedPf(null)} className="text-[#777A70]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClearPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Amount Collecting (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedPf.remainingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-bold text-base text-[#1E3B2E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Payment Method *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="card">Card (POS Counter Terminal)</option>
                  <option value="cash">Cash (Desk Currency)</option>
                  <option value="bank_transfer">Bank IMPS / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Reference / Note</label>
                <input
                  type="text"
                  placeholder="e.g. UPI transaction ID..."
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPf(null)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />
    </div>
  );
};
