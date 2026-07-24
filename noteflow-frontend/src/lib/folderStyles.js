import { Folder, GraduationCap, Code2, BarChart3, Globe } from 'lucide-react';

// Maps backend Folder.icon/color choices to actual rendering. Kept in one
// place so a new icon/color option is a single-file change.
export const FOLDER_ICONS = {
  folder: Folder,
  'graduation-cap': GraduationCap,
  code: Code2,
  'bar-chart': BarChart3,
  globe: Globe,
};

export const FOLDER_COLORS = {
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/15', text: 'text-purple-500' },
  blue: { bg: 'bg-accent-50 dark:bg-accent-500/15', text: 'text-accent-500' },
  amber: { bg: 'bg-pending-500/10', text: 'text-pending-500' },
  green: { bg: 'bg-approved-500/10', text: 'text-approved-500' },
};
