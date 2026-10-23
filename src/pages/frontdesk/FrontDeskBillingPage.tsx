import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Invoice, 
  PaymentTransaction, 
  PaymentFollowUp, 
  Customer 
} from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  CreditCard, 
  Plus, 
  Search, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText, 
  ArrowRight,
  ClockAlert
} from 'lucide-react';

export const FrontDeskBillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  // Modals
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isPostponeOpen, setIsPostponeOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice State
  const [invCustomerId, setInvCustomerId] = useState('');
  const [invItemName, setInvItemName] = useState('');
  const [invSubtotal, setInvSubtotal] = useState(3500);
  const [invDiscount, setInvDiscount] = useState(0);

  // Payment Record State
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer'>('upi');
  const [payTxnRef, setPayTxnRef] = useState('');
  const [payRemarks, setPayRemarks] = useState('');

  // Postponement State
  const [postponeReason, setPostponeReason] = useState('');
  const [expectedDate, setExpectedDate] = useState('2026-10-05');
  const [postponeRemarks, setPostponeRemarks] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invs, custs] = await Promise.all([
        api.getInvoices(),
        api.getCustomers()
      ]);
      setInvoices(invs);
      setCustomers(custs);
      if (custs.length > 0) setInvCustomerId(custs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === invCustomerId);
    if (!cust) return;

    try {
      await api.createInvoice({
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        serviceOrPackageName: invItemName || 'Sanctuary Protocol',
        invoiceDate: '2026-10-02',
        subtotal: Number(invSubtotal),
        discount: Number(invDiscount),
        tax: 0,
        status: 'unpaid'
      });

      setIsNewInvoiceOpen(false);
      setInvItemName('');
      loadData();
      alert('Invoice created successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice.');
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await api.createPayment({
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerId: selectedInvoice.customerId,
        customerName: selectedInvoice.customerName,
        amountReceived: Number(payAmount),
        paymentMethod: payMethod,
        paymentDate: new Date().toISOString(),
        transactionRef: payTxnRef,
        recordedBy: 'Sneha Rao (Front Desk)',
        remarks: payRemarks
      });

      setIsRecordPaymentOpen(false);
      setSelectedInvoice(null);
      setPayTxnRef('');
      setPayRemarks('');
      loadData();
      alert('Payment receipt logged and invoice balance updated.');
    } catch (err: any) {
      alert(err.message || 'Failed to record payment.');
    }
  };

  const handlePostponeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await api.createPaymentPostponement({
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerId: selectedInvoice.customerId,
        customerName: selectedInvoice.customerName,
        customerPhone: selectedInvoice.customerPhone,
        amountBilled: selectedInvoice.finalBilledAmount,
        amountReceived: selectedInvoice.paidAmount,
        remainingBalance: selectedInvoice.outstandingBalance,
        postponementReason: postponeReason,
        expectedPaymentDate: expectedDate,
        assignedFollowUpOwner: 'Sneha Rao (Front Desk)',
        remarks: postponeRemarks
      });

      setIsPostponeOpen(false);
      setSelectedInvoice(null);
      setPostponeReason('');
      setPostponeRemarks('');
      loadData();
      alert('Payment postponement recorded. Added to Payment Follow-ups queue.');
    } catch (err: any) {
      alert(err.message || 'Failed to postpone payment.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Reception Billing & Payment Ledger</h1>
          <p className="text-xs text-[#777A70]">Multi-transaction invoices, live outstanding balances, and postponement scheduling.</p>
        </div>

        <button
          onClick={() => setIsNewInvoiceOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Item / Protocol</th>
                <th className="py-3 px-4">Billed Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1E3B2E]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#252923]">
                    {inv.customerName}
                  </td>
                  <td className="py-3.5 px-4 text-[#585B53]">
                    {inv.serviceOrPackageName}
                  </td>
                  <td className="py-3.5 px-4 font-semibold tabular-nums text-[#252923]">
                    ₹{inv.finalBilledAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 tabular-nums">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-700 tabular-nums">
                    ₹{inv.outstandingBalance.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                      inv.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      inv.status === 'payment_postponed' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {inv.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {inv.outstandingBalance > 0 && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPayAmount(inv.outstandingBalance);
                            setIsRecordPaymentOpen(true);
                          }}
                          className="px-2.5 py-1 bg-[#1E3B2E] text-white rounded text-[11px] font-semibold hover:bg-[#2A5140] transition-colors"
                        >
                          Record Payment
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPostponeOpen(true);
                          }}
                          className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[11px] font-semibold hover:bg-amber-200"
                        >
                          Postpone
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setActive360CustomerId(inv.customerId)}
                      className="px-2 py-1 text-[#1E3B2E] hover:bg-[#F0EEE5] rounded text-[11px] font-semibold"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE INVOICE */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Generate Client Invoice</h3>
              <button onClick={() => setIsNewInvoiceOpen(false)} className="text-[#777A70]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Customer *</label>
                <select
                  value={invCustomerId}
                  onChange={(e) => setInvCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Item / Treatment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydra-Infusion Facial or 6-Session Package"
                  value={invItemName}
                  onChange={(e) => setInvItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Subtotal (₹) *</label>
                  <input
                    type="number"
                    required
                    value={invSubtotal}
                    onChange={(e) => setInvSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Authorized Discount (₹)</label>
                  <input
                    type="number"
                    value={invDiscount}
                    onChange={(e) => setInvDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Net Billed Amount:</span>
                  <strong className="text-[#1E3B2E] text-sm">
                    ₹{Math.max(0, invSubtotal - invDiscount).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {isRecordPaymentOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Record Payment Receipt</h3>
                <p className="text-xs text-[#777A70]">{selectedInvoice.invoiceNumber} · {selectedInvoice.customerName}</p>
              </div>
              <button onClick={() => setIsRecordPaymentOpen(false)} className="text-[#777A70]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedInvoice.outstandingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-bold text-base text-[#1E3B2E]"
                />
                <span className="text-[10px] text-[#777A70] mt-0.5 block">
                  Remaining balance on invoice: ₹{selectedInvoice.outstandingBalance.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-medium"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="card">Card (POS Counter Terminal)</option>
                    <option value="cash">Cash (Desk Currency)</option>
                    <option value="bank_transfer">Bank IMPS / NEFT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Transaction Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-9849012345"
                    value={payTxnRef}
                    onChange={(e) => setPayTxnRef(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Reception Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in full via reception QR code..."
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Confirm & Credit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT POSTPONEMENT */}
      {isPostponeOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-amber-900">Postpone Payment</h3>
                <p className="text-xs text-[#777A70]">{selectedInvoice.customerName} · Due: ₹{selectedInvoice.outstandingBalance.toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setIsPostponeOpen(false)} className="text-[#777A70]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostponeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Reason for Postponement *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Daily UPI limit reached; client will transfer by tomorrow morning..."
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Expected Payment Date *</label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostponeOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white rounded-lg font-semibold hover:bg-amber-900"
                >
                  Save Postponement Task
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
