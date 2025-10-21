import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, Calendar, Wallet, User, FileText } from "lucide-react";
import { PaymentReceipt } from "./BasePayButton";

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = () => {
    // Load Base Pay transactions
    const basePayments = JSON.parse(localStorage.getItem('base_payments') || '[]');
    setPayments(basePayments);

    // Load consultation bookings
    const consultationBookings = JSON.parse(localStorage.getItem('consultationBookings') || '[]');
    setBookings(consultationBookings);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const combinedTransactions = [
    ...payments.map(p => ({ ...p, type: 'payment' as const })),
    ...bookings.map(b => ({ ...b, type: 'booking' as const }))
  ].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.bookedAt).getTime();
    const dateB = new Date(b.timestamp || b.bookedAt).getTime();
    return dateB - dateA;
  });

  if (combinedTransactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
          <p className="text-sm text-gray-600">
            Your payments and bookings will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment History</h2>
      
      {combinedTransactions.map((transaction, index) => {
        if (transaction.type === 'payment') {
          const payment = transaction as PaymentReceipt & { type: 'payment' };
          return (
            <Card key={`payment-${index}`} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Payment Successful</CardTitle>
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {payment.network}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Amount */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Amount Paid:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${parseFloat(payment.amount).toLocaleString()} USDC
                  </span>
                </div>

                {/* Service Details */}
                {payment.lawyerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Lawyer:</span>
                    <span className="font-medium">{payment.lawyerName}</span>
                  </div>
                )}
                
                {payment.serviceName && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{payment.serviceName}</span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{formatDate(payment.timestamp)}</span>
                </div>

                {/* Transaction Details */}
                <div className="pt-3 border-t space-y-2">
                  <div className="text-xs text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>From:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {payment.sender.slice(0, 6)}...{payment.sender.slice(-4)}
                      </code>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>To:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span>Tx Hash:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {payment.transactionHash.slice(0, 6)}...{payment.transactionHash.slice(-4)}
                      </code>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(payment.explorerUrl, '_blank')}
                  >
                    View on Basescan
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          const booking = transaction;
          return (
            <Card key={`booking-${index}`} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Consultation Booked</CardTitle>
                  </div>
                  <Badge variant={booking.status === 'paid' ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Lawyer */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Lawyer:</span>
                  <span className="font-medium">{booking.lawyer}</span>
                </div>

                {/* Services */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Services:</span>
                  </div>
                  <ul className="list-disc list-inside pl-6 text-sm">
                    {booking.services.map((service: string, idx: number) => (
                      <li key={idx}>{service}</li>
                    ))}
                  </ul>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <span className="text-lg font-bold text-purple-600">
                    ${booking.totalWithConsultation.toLocaleString()}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{formatDate(booking.bookedAt)}</span>
                </div>

                {/* Payment Method */}
                <div className="pt-3 border-t">
                  <Badge variant="outline" className="text-xs">
                    {booking.paymentMethod === 'base' ? '💳 Paid with Base' : '📋 Traditional Booking'}
                  </Badge>
                  
                  {booking.transactionHash && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => window.open(booking.paymentReceipt?.explorerUrl, '_blank')}
                    >
                      View Transaction
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }
      })}
    </div>
  );
}
