import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { logger } from "@/utils/logger";
import { pay, getPaymentStatus } from '@base-org/account';

// Base Pay using official Base Account SDK

interface BasePayButtonProps {
  recipient?: string;
  amount: number; // Amount in USDC
  serviceName?: string;
  lawyerName?: string;
  className?: string;
  onSuccess?: (txHash: string, receipt: PaymentReceipt) => void;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
}

export interface PaymentReceipt {
  transactionHash: string;
  amount: string;
  recipient: string;
  sender: string;
  timestamp: string;
  network: 'Base' | 'Base Sepolia';
  serviceName?: string;
  lawyerName?: string;
  explorerUrl: string;
}

export default function BasePayButton({
  recipient,
  amount,
  serviceName,
  lawyerName,
  className,
  onSuccess,
  variant = "default",
  size = "default",
  disabled = false
}: BasePayButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePay = async () => {
    if (!recipient) {
      toast.error("No recipient wallet address available");
      return;
    }

    if (amount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    setIsPaying(true);
    setPaymentSuccess(false);
    setTxHash(null);

    try {
      logger.info('Initiating Base Pay transaction', {
        action: 'base_pay_initiate',
        metadata: {
          amount: amount.toString(),
          recipient: recipient.slice(0, 6) + '...',
        }
      });

      toast.info("Processing payment with Base Pay...");

      // Use Base Account SDK pay() function
      const payment = await pay({
        amount: amount.toString(),
        to: recipient,
        testnet: true // Set to true for Base Sepolia testnet
      });

      setTxHash(payment.id);
      
      toast.info("Checking payment status...", {
        duration: 3000,
      });

      // Poll for payment status
      const status = await getPaymentStatus({
        id: payment.id,
        testnet: true // Must match testnet setting from pay()
      });

      if (status.status === 'completed') {
        // Create payment receipt
        const paymentReceipt: PaymentReceipt = {
          transactionHash: payment.id,
          amount: amount.toString(),
          recipient,
          sender: (status as any).from || 'Base Account',
          timestamp: new Date().toISOString(),
          network: 'Base Sepolia',
          serviceName,
          lawyerName,
          explorerUrl: `https://sepolia.basescan.org/tx/${payment.id}`
        };

        // Store payment in localStorage
        const payments = JSON.parse(localStorage.getItem('base_payments') || '[]');
        payments.push(paymentReceipt);
        localStorage.setItem('base_payments', JSON.stringify(payments));

        logger.info('Base Pay transaction successful', {
          action: 'base_pay_success',
          metadata: {
            txHash: payment.id,
            amount: amount.toString(),
            status: status.status
          }
        });

        setPaymentSuccess(true);
        toast.success("🎉 Payment completed successfully!");

        if (onSuccess) {
          onSuccess(payment.id, paymentReceipt);
        }
      } else {
        throw new Error(`Payment status: ${status.status}`);
      }

    } catch (error: unknown) {
      logger.error('Base Pay transaction failed', {
        action: 'base_pay_error',
        error: error instanceof Error ? error.message : String(error)
      });

      if (error && typeof error === 'object' && 'code' in error && error.code === 4001) {
        toast.error("Payment rejected by user");
      } else {
        const message = error instanceof Error ? error.message : "Payment failed";
        toast.error(message);
      }
      
      setPaymentSuccess(false);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={className}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Pay with BASE
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Pay with BASE
            </DialogTitle>
            <DialogDescription>
              Secure USDC payment on Base network
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Network Info */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant="secondary" className="bg-blue-600 text-white">
                Base
              </Badge>
            </div>

            {/* Service Details */}
            {(serviceName || lawyerName) && (
              <div className="border-t pt-3 space-y-2">
                {lawyerName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lawyer:</span>
                    <span className="font-medium">{lawyerName}</span>
                  </div>
                )}
                {serviceName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{serviceName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Amount */}
            <div className="border-t border-b py-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${amount.toLocaleString()} USDC
                </span>
              </div>
            </div>

            {/* Transaction Hash */}
            {txHash && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className={`h-4 w-4 ${paymentSuccess ? 'hidden' : 'animate-spin'} text-green-600`} />
                  <CheckCircle className={`h-4 w-4 ${paymentSuccess ? 'block' : 'hidden'} text-green-600`} />
                  <span className="text-sm font-medium text-green-800">
                    {paymentSuccess ? 'Payment Confirmed' : 'Processing...'}
                  </span>
                </div>
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  View on Basescan
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Recipient Info */}
            {recipient && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>To: {recipient.slice(0, 6)}...{recipient.slice(-4)}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPaying}
              className="w-full sm:w-auto"
            >
              {paymentSuccess ? 'Close' : 'Cancel'}
            </Button>
            {!paymentSuccess && (
              <Button
                onClick={handlePay}
                disabled={isPaying || !recipient}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Pay ${amount.toLocaleString()}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
