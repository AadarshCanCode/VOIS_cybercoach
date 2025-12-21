import React, { useRef } from 'react';
import { Award, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '@lib/supabase';
import { useAuth } from '@context/AuthContext';
import type { User } from '@types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  studentName: string;
  completionDate: Date;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  courseName,
  studentName,
  completionDate
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { user, updateUser } = useAuth();

  if (!isOpen) return null;

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
    if (!blob) {
      console.error('Failed to generate certificate blob');
      return;
    }

    const userId = user?.id ?? null;
    if (!userId) {
      console.warn('No authenticated user in context; certificate will not be saved to DB.');
    } else {
      const fileExt = 'png';
  const sanitizedCourse = courseName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      const fileName = `${userId}_${sanitizedCourse}_${Date.now()}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage.from('certificates').upload(filePath, blob, { contentType: 'image/png' });
        if (uploadError) {
          console.error('Failed to upload certificate to storage:', uploadError.message ?? uploadError);
        } else {
          const { data: publicData } = supabase.storage.from('certificates').getPublicUrl(filePath);
          const publicUrl = publicData?.publicUrl ?? '';

            try {
            const { data: userRow, error: fetchErr } = await supabase.from('users').select('certificates').eq('id', userId).maybeSingle();
            if (fetchErr) {
              console.warn('Failed to fetch user row to append certificate:', fetchErr.message ?? fetchErr);
            }
            const existing = userRow?.certificates ?? [];
            const newArr = Array.isArray(existing) ? [...existing, publicUrl] : [publicUrl];

            const { error: updateErr } = await supabase.from('users').update({ certificates: newArr }).eq('id', userId);
            if (updateErr) {
              console.error('Failed to update user certificates array:', updateErr.message ?? updateErr);
            } else {
              // update local user object to include this certificate (so UI updates instantly)
              if (updateUser) {
                const patched: Partial<User> = { certificates: newArr };
                try {
                  updateUser(patched);
                } catch (e) {
                  // non-fatal, log briefly
                  console.warn('updateUser call failed:', (e as Error).message ?? e);
                }
              }
            }
          } catch (e) {
            console.error('Failed to append certificate to user row:', (e as Error).message ?? e);
          }
        }
      } catch (error) {
        console.error('Failed to save/upload certificate:', (error as Error).message ?? error);
      }
    }

    // Download certificate locally as well
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${courseName.replace(/\s+/g, '_')}_Certificate.png`;
    link.href = url;
    link.click();
    // free object URL
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const formattedDate = completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full">
        <div className="p-6">
          <div ref={certificateRef} className="p-12 rounded-lg code-bg border-8 border-double border-slate-700">
            <div className="text-center">
              <Award className="h-16 w-16 text-accent mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-primary mb-2">Certificate of Completion</h2>
              <p className="text-muted mb-8">This is to certify that</p>

              <p className="text-2xl font-bold text-accent mb-6">{studentName}</p>

              <p className="text-muted mb-4">has successfully completed the course</p>

              <p className="text-2xl font-bold text-primary mb-8">{courseName}</p>

              <p className="text-muted mb-8">on {formattedDate}</p>

              <div className="max-w-xs mx-auto border-t-2 border-slate-700 pt-4">
                <p className="text-muted text-sm">Course Instructor Signature</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card px-6 py-4 rounded-b-lg flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted hover:text-primary transition-colors"
          >
            Close
          </button>
          <button
            onClick={downloadCertificate}
            className="btn-primary px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};