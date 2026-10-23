import { notFound } from 'next/navigation';
import Image from 'next/image';

async function getQuotation(id: string) {
  try {
    const res = await fetch(`http://localhost:3001/quotations/public/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function QuotationPdfPage({ params }: { params: { id: string } }) {
  const quotation = await getQuotation(params.id);

  if (!quotation) {
    notFound();
  }

  const { tenant, customer, quotationItems } = quotation;
  const primaryColor = tenant.primaryColor || '#000000';

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans p-8 print:p-0">
      <div className="max-w-[210mm] mx-auto bg-white p-12 shadow-lg print:shadow-none print:p-0">
        
        {/* Header */}
        <header className="flex justify-between items-start border-b-2 pb-6 mb-8" style={{ borderColor: primaryColor }}>
          <div>
            {tenant.logoUrl ? (
              <div className="relative w-48 h-16">
                <Image src={tenant.logoUrl} alt={tenant.name} fill className="object-contain object-left" />
              </div>
            ) : (
              <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>{tenant.name}</h1>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-slate-400 mb-2">QUOTATION</h2>
            <p className="font-semibold text-lg">{quotation.quotationNumber}</p>
            <p className="text-sm text-slate-500">Date: {new Date(quotation.createdAt).toLocaleDateString()}</p>
            {quotation.validUntil && (
              <p className="text-sm text-slate-500">Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</p>
            )}
          </div>
        </header>

        {/* Info Blocks */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-2">Prepared For</h3>
            <p className="font-semibold text-lg">{customer.name}</p>
            {customer.email && <p className="text-slate-600">{customer.email}</p>}
            <p className="text-slate-600">{customer.phone}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-2">Trip Details</h3>
            <p><span className="font-semibold">Destination:</span> {quotation.destination || 'Not specified'}</p>
            <p>
              <span className="font-semibold">Travel Dates:</span>{' '}
              {quotation.travelDate ? new Date(quotation.travelDate).toLocaleDateString() : 'TBD'}{' '}
              {quotation.returnDate && `- ${new Date(quotation.returnDate).toLocaleDateString()}`}
            </p>
            <p><span className="font-semibold">Passengers:</span> {quotation.adults} Adults, {quotation.children} Children, {quotation.infants} Infants</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                <th className="py-3 font-semibold text-slate-700 w-1/4">Category</th>
                <th className="py-3 font-semibold text-slate-700 w-1/2">Description</th>
                <th className="py-3 font-semibold text-slate-700 text-right w-1/4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotationItems.map((item: any) => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="py-4 capitalize font-medium">{item.category.replace('_', ' ')}</td>
                  <td className="py-4 text-slate-600">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    {item.description && <p className="text-sm mt-1 whitespace-pre-wrap">{item.description}</p>}
                  </td>
                  <td className="py-4 text-right font-medium">₹{Number(item.customerPrice).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2 bg-slate-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-medium">₹{Number(quotation.totalCustomerPrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4">
              <span className="text-xl font-bold" style={{ color: primaryColor }}>Total Amount</span>
              <span className="text-xl font-bold">₹{Number(quotation.totalCustomerPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer / Notes */}
        {quotation.notes && (
          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-2">Terms & Notes</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}

        <div className="mt-16 text-center text-slate-400 text-sm border-t pt-8">
          <p>Thank you for choosing {tenant.name}. We look forward to planning your trip!</p>
        </div>
      </div>
    </div>
  );
}
