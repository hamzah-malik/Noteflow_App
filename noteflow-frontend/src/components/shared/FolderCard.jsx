import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Trash2, Share2 } from 'lucide-react';
import { FOLDER_ICONS, FOLDER_COLORS } from '@/lib/folderStyles';
import { deleteFolder } from '@/api/folders';
import { useToast } from './ToastProvider';
import ConfirmDialog from './ConfirmDialog';
import ShareFolderDialog from './ShareFolderDialog';

export default function FolderCard({ folder, readOnly = false }) {
  const Icon = FOLDER_ICONS[folder.icon] || FOLDER_ICONS.folder;
  const color = FOLDER_COLORS[folder.color] || FOLDER_COLORS.blue;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    await deleteFolder(folder.id);
    showToast(`"${folder.name}" was removed. Its notes weren't deleted.`, { title: 'Folder deleted' });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    setConfirmOpen(false);
  };

  return (
    <div className="card-surface relative flex flex-col gap-3 rounded-[var(--radius-card)] p-4 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.bg} ${color.text}`}>
          <Icon size={18} />
        </div>
        {!readOnly && (
          <div className="relative">
            <button onClick={() => setMenuOpen((m) => !m)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="card-surface absolute right-0 top-6 z-20 w-40 rounded-lg p-1">
                  <button
                    onClick={() => { setMenuOpen(false); setShareOpen(true); }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  >
                    <Share2 size={13} /> Share folder
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-rejected-500 hover:bg-rejected-500/10"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Link to={`/notes?folder=${folder.id}`} onClick={(e) => { if (menuOpen) e.preventDefault(); }}>
        <p className="font-medium text-[var(--text-primary)]">{folder.name}</p>
        <p className="text-xs text-[var(--text-secondary)]">{folder.notes_count} notes</p>
      </Link>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this folder?"
        message={`"${folder.name}" will be removed. Notes inside it won't be deleted, just un-filed.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <ShareFolderDialog
        folder={folder}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
