
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export default function UploadImage() {
  const [session, setSession] = useState<Session | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <p>Prijavi se, da lahko nalagaš slike.</p>;
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Izberi datoteko.');
      return;
    }

    const { data, error } = await supabase.storage
      .from('images')
      .upload(`public/${file.name}`, file);

    if (error) {
      setMessage(`Napaka: ${error.message}`);
    } else {
      setMessage(`Uspešno naloženo: ${data.path}`);
    }
  };

  return (
    <div className="upload-section">
      <h3>Naloži sliko</h3>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}
