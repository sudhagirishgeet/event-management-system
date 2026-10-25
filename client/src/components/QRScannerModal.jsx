import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import api from '../services/api';

const QRScannerModal = ({ eventId, onClose }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    async function onScanSuccess(decodedText) {
      scanner.pause();
      setLoading(true);
      setError(null);
      setScanResult(null);

      try {
        const res = await api.post('/checkins/scan', {
          qrSecret: decodedText,
          eventId
        });
        setScanResult(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Check-in failed.');
      } finally {
        setLoading(false);
      }
    }

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch(err => console.error('Failed to clear scanner', err));
    };
  }, [eventId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-base/90 backdrop-blur-md">
      <div className="bg-dark-card border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-400" />
            Scan Ticket QR Code
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Feed Target Container */}
        <div id="qr-reader" className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800" />

        {loading && (
          <div className="p-3 bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs rounded-lg text-center font-medium">
            Verifying ticket with backend database...
          </div>
        )}

        {scanResult && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>ENTRY APPROVED</span>
            </div>
            <p><strong>Attendee:</strong> {scanResult.attendeeName}</p>
            <p><strong>Tickets:</strong> {scanResult.tickets.join(', ')}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-2 text-sm font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>ENTRY DENIED</span>
            </div>
            <p>{error}</p>
          </div>
        )}

        <p className="text-[11px] text-slate-500 text-center">
          Point the device camera at the attendee's digital ticket QR code.
        </p>
      </div>
    </div>
  );
};

export default QRScannerModal;
