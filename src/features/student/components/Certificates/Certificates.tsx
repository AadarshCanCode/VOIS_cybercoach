import React, { useState } from 'react';
import { Award, Download, Calendar, Shield, ExternalLink, GraduationCap } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { CertificateModal } from './CertificateModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { cn } from '@lib/utils';

export const Certificates: React.FC = () => {
  const { user } = useAuth();
  const earnedCertificates = user?.certificates || [];

  const [viewCertificate, setViewCertificate] = useState<{
    isOpen: boolean;
    courseName: string;
    date: Date;
  } | null>(null);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500 min-h-screen">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          Official <span className="text-primary">Credentials</span>
        </h1>
        <p className="text-muted-foreground">
          Verifiable certifications earned through your training operations.
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
            Acquired Certifications
          </h2>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {earnedCertificates.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {earnedCertificates.map((certificateEntry: string, idx: number) => {
              const isUrl = typeof certificateEntry === 'string' && (certificateEntry.startsWith('http://') || certificateEntry.startsWith('https://'));

              if (isUrl) {
                const filename = certificateEntry.split('/').pop() || "";
                const parts = filename.split('_');
                let displayTitle = "Classified Operation";
                if (parts.length >= 2) {
                  displayTitle = parts[1].replace(/%20/g, ' ');
                }
                const timestamp = parseInt(parts[2]?.split('.')[0] || '0');
                const completionDate = timestamp ? new Date(timestamp) : new Date();

                return (
                  <Card
                    key={`url-${idx}`}
                    className="group overflow-hidden border-border/50 hover:border-primary/40 transition-all duration-300 bg-secondary/30 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                            {displayTitle}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary/70">
                            <Shield className="h-3 w-3" />
                            Digital ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                          </CardDescription>
                        </div>
                        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          Issued on {completionDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 text-xs font-semibold"
                            asChild
                          >
                            <a href={certificateEntry} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              Preview
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            className="h-9 px-4 text-xs font-bold"
                            onClick={() => setViewCertificate({
                              isOpen: true,
                              courseName: displayTitle,
                              date: completionDate
                            })}
                          >
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2 py-20 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="bg-muted/50 p-6 rounded-full border border-border/50">
                <Award className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">No Credentials Found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                  You haven't earned any certifications yet. Complete your first course to unlock your official credentials.
                </p>
              </div>
              <Button variant="outline" className="mt-4">
                Browse Available Operations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {viewCertificate && (
        <CertificateModal
          isOpen={viewCertificate.isOpen}
          onClose={() => setViewCertificate(null)}
          courseName={viewCertificate.courseName}
          studentName={user?.name || 'Student'}
          completionDate={viewCertificate.date}
          isVU={true}
          facultyName="Kiran Deshpande"
        />
      )}
    </div>
  );
};
