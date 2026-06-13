import { Cloud, FileText, HardDrive, ImageIcon, PenTool } from 'lucide-react'

import type { AttachmentProvider } from './types'

/**
 * Attachment provider registry. Adding a new source (Dropbox, Notion,
 * GitHub, LinkedIn import…) is a single registerAttachmentProvider() call —
 * the menu renders it automatically, no component changes needed.
 */
const providers: AttachmentProvider[] = [
  {
    id: 'local',
    title: 'Add from local files',
    description: 'PDF, DOCX, TXT, Markdown',
    icon: <FileText className="h-[1.05rem] w-[1.05rem]" />,
    enabled: true,
  },
  {
    id: 'gdrive',
    title: 'Add from Google Drive',
    icon: <HardDrive className="h-[1.05rem] w-[1.05rem]" />,
    enabled: false,
    badge: 'Coming Soon',
    comingSoonMessage: 'Google Drive integration is coming soon.',
  },
  {
    id: 'onedrive',
    title: 'Add from OneDrive',
    icon: <Cloud className="h-[1.05rem] w-[1.05rem]" />,
    enabled: false,
    badge: 'Coming Soon',
    comingSoonMessage: 'OneDrive integration is coming soon.',
  },
  {
    id: 'figma',
    title: 'Add from Figma',
    icon: <PenTool className="h-[1.05rem] w-[1.05rem]" />,
    enabled: false,
    badge: 'Coming Soon',
    comingSoonMessage: 'Figma integration is coming soon.',
  },
  {
    id: 'images',
    title: 'Add Images',
    icon: <ImageIcon className="h-[1.05rem] w-[1.05rem]" />,
    enabled: false,
    badge: 'Coming Soon',
    comingSoonMessage: 'Image uploads are coming soon.',
  },
]

export function registerAttachmentProvider(provider: AttachmentProvider): void {
  const existing = providers.findIndex((p) => p.id === provider.id)
  if (existing >= 0) providers[existing] = provider
  else providers.push(provider)
}

export function getAttachmentProviders(): AttachmentProvider[] {
  return [...providers]
}
