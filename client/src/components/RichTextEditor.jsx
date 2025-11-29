import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import Loader from './Loader';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import { Node } from '@tiptap/core';
import axios from 'axios';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Pilcrow, List, ListOrdered,
    Image as ImageIcon, Video, Undo, Redo, Youtube as YoutubeIcon
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const VideoExtension = Node.create({
    name: 'video',
    group: 'block',
    selectable: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', { ...HTMLAttributes, controls: true, class: 'w-full rounded-lg shadow-md aspect-video my-6' }]
    },

    addCommands() {
        return {
            setVideo: options => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                })
            },
        }
    },
});

const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center
      ${isActive
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
    >
        {children}
    </button>
);

const MenuBar = ({ editor }) => {
    const { showNotification } = useNotification();
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) {
        return null;
    }

    const addImage = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    // Get upload URL
                    const { data } = await axios.get(`${API_URL}/media/upload-url?fileName=${file.name}&fileType=${file.type}`);
                    // Upload to S3
                    await axios.put(data.url, file, { headers: { 'Content-Type': file.type } });
                    // Insert into editor (using the URL without query params)
                    editor.chain().focus().setImage({ src: data.publicUrl }).run();
                } catch (error) {
                    console.error("Image upload failed", error);
                    showNotification("Failed to upload image", "error");
                } finally {
                    setIsUploading(false);
                }
            } else {
                setIsUploading(false);
            }
        };
        setIsUploading(true);
        input.click();
    };

    const addVideoFile = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    // Get upload URL
                    const { data } = await axios.get(`${API_URL}/media/upload-url?fileName=${file.name}&fileType=${file.type}`);
                    // Upload to S3
                    await axios.put(data.url, file, { headers: { 'Content-Type': file.type } });
                    // Insert into editor
                    editor.chain().focus().setVideo({ src: data.publicUrl }).run();
                } catch (error) {
                    console.error("Video upload failed", error);
                    showNotification("Failed to upload video", "error");
                } finally {
                    setIsUploading(false);
                }
            } else {
                setIsUploading(false);
            }
        };
        setIsUploading(true);
        input.click();
    };

    const addYoutubeVideo = () => {
        const url = prompt('Enter YouTube URL');
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    return (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 sticky top-0 bg-white z-10 rounded-t-lg">
            <div className="flex gap-1 pr-2 border-r border-gray-200">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                    <Bold size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                    <Italic size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                    <UnderlineIcon size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
                    <Strikethrough size={18} />
                </MenuButton>
            </div>

            <div className="flex gap-1 px-2 border-r border-gray-200">
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                    <Heading1 size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <Heading2 size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Paragraph">
                    <Pilcrow size={18} />
                </MenuButton>
            </div>

            <div className="flex gap-1 px-2 border-r border-gray-200">
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                    <List size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
                    <ListOrdered size={18} />
                </MenuButton>
            </div>

            <div className="flex gap-1 px-2 border-r border-gray-200">
                <MenuButton onClick={addImage} title="Upload Image">
                    <ImageIcon size={18} />
                </MenuButton>
                <MenuButton onClick={addVideoFile} title="Upload Video">
                    <Video size={18} />
                </MenuButton>
                <MenuButton onClick={addYoutubeVideo} title="Embed YouTube">
                    <YoutubeIcon size={18} />
                </MenuButton>
            </div>

            <div className="flex gap-1 pl-2 ml-auto">
                <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                    <Undo size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                    <Redo size={18} />
                </MenuButton>
            </div>
            {isUploading && (
                <div className="flex items-center gap-2 px-2 border-l border-gray-200">
                    <Loader size="small" />
                    <span className="text-xs text-gray-500 font-medium">Uploading...</span>
                </div>
            )}
        </div>
    );
};

const RichTextEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg shadow-md max-w-full mx-auto my-6',
                },
            }),
            Youtube.configure({
                controls: false,
                HTMLAttributes: {
                    class: 'rounded-lg shadow-md w-full aspect-video mx-auto my-6',
                },
            }),
            Underline,
            VideoExtension,
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-lg prose-indigo max-w-none focus:outline-none min-h-[300px] px-6 py-4',
            },
        },
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div
            className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.stopPropagation();
                }
            }}
        >
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
