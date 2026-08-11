import React from 'react';
import { useApp } from '../context/AppContext';
import { MelalaLogo } from './MelalaLogo';
import {
  X,
  Printer,
  Download,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  CreditCard,
  QrCode,
} from 'lucide-react';

export const ProFormaInvoiceModal: React.FC = () => {
  const { proFormaModalOrder, setProFormaModalOrder } = useApp();

  if (!proFormaModalOrder) return null;

  const order = proFormaModalOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Action Bar (Screen Only) */}
        <div className="bg-slate-900 text-slate-100 p-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm">Official B2B Pro-Forma Invoice</h3>
              <p className="text-[11px] text-slate-400">Pro-Forma #: {order.proFormaNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={() => setProFormaModalOrder(null)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PRO-FORMA INVOICE DOCUMENT */}
        <div id="printable-proforma" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
            <div>
              <MelalaLogo variant="full" size="md" />
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Kaliti Industrial Zone, Road 4, Addis Ababa, Ethiopia
                <br />
                Tel: +251 911 848 166 | Email: melalapharmaceuticalwholesale@mail.com | TIN: 0001928374
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 border border-slate-200 p-3 rounded-lg min-w-[200px]">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
                PRO-FORMA INVOICE
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {order.proFormaNumber}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB')}
              </div>
              <div className="text-[11px] text-slate-500">
                Valid Until: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Billed To / Customer Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                BILLED TO / HEALTHCARE FACILITY
              </div>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                {order.facilityName}
              </div>
              <p className="text-slate-600 mt-0.5">
                Facility Type: {order.facilityType}
                <br />
                City: {order.deliveryCity}
                <br />
                Address: {order.deliveryAddress}
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                REGULATORY & TAX CREDENTIALS
              </div>
              <div className="mt-1 space-y-1 font-mono text-slate-700">
                <div className="flex items-center gap-1 text-teal-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>EFDA Reg: Approved B2B Client</span>
                </div>
                <div>Payment Terms: {order.paymentMethod}</div>
                <div>Dispatch Method: {order.coldChainHandling ? 'Cold-Chain Express' : 'Standard Freight'}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Item & Specification</th>
                  <th className="p-2.5">Pack Size</th>
                  <th className="p-2.5">Batch & Expiry</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {order.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2.5 font-bold text-slate-900">
                      {item.productName}
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>
                    </td>
                    <td className="p-2.5 text-slate-600">{item.packSize}</td>
                    <td className="p-2.5 text-slate-600 font-mono text-[11px]">
                      Batch #{item.batchNo} (Exp: {item.expiryDate})
                    </td>
                    <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="p-2.5 text-right font-medium">{item.unitPriceEtb.toLocaleString()} ETB</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {item.lineTotalEtb.toLocaleString()} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Breakdown & Payment Banking Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Bank Payment Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <CreditCard className="w-4 h-4 text-teal-700" />
                <span>Melala Official Bank Accounts for Remittance</span>
              </div>

              <div className="space-y-1.5 text-slate-700 text-[11px]">
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="font-bold text-slate-900">Commercial Bank of Ethiopia (CBE)</div>
                  <div>Account No: <span className="font-mono font-bold text-teal-800">1000 2938 48192</span></div>
                </div>

                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="font-bold text-slate-900">Dashen Bank</div>
                  <div>Account No: <span className="font-mono font-bold text-teal-800">0129 3847 1002</span></div>
                </div>

                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="font-bold text-slate-900">Telebirr Merchant Pay Code</div>
                  <div>Till Number: <span className="font-mono font-bold text-teal-800">882910</span></div>
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Subtotal Items:</span>
                <span className="font-bold text-slate-900">{order.subtotalEtb.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Ethiopian VAT (15%):</span>
                <span>{order.vatEtb.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Freight & Handling:</span>
                <span>{order.shippingFeeEtb.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-extrabold text-teal-800 bg-teal-50 p-2.5 rounded-lg">
                <span>TOTAL AMOUNT DUE:</span>
                <span>{order.totalAmountEtb.toLocaleString()} ETB</span>
              </div>

              {/* Official Stamp & Approval */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <div className="text-[10px] text-slate-500">
                  Issued by Melala Finance Division
                  <br />
                  Addis Ababa Central Operations
                </div>

                <div className="border-2 border-teal-700 rounded-lg p-2 text-center text-teal-800 text-[10px] font-bold uppercase tracking-wider rotate-[-2deg] bg-teal-50">
                  <div>MELALA PHARMA WHOLESALE</div>
                  <div className="text-[8px] text-teal-600 font-semibold">OFFICIALLY STAMPED</div>
                  <CheckCircle2 className="w-4 h-4 mx-auto text-teal-700 mt-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
