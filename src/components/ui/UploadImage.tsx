
import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../integrations/supabase/client';

export default function UploadImage() {
  const session = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  if (!session) {
    return <p>Prijavi se, da lahko nalagaš slike.</p>;
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Izberi datoteko.');
      return;
    }

    const { data, error } = await supabase.storage
      .from('images') // ime bucket-a v Supabase
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
``

