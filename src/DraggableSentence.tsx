import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableSentenceProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export const DraggableSentence: React.FC<DraggableSentenceProps> = ({ id, children, className, disabled }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: isDragging ? 0.3 : 1, // Lower opacity to create a "hole" effect
        cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        zIndex: isDragging ? 2 : 'auto',
        position: 'relative' as const,
    };

    const combinedClassName = `
        ${className || ''} 
        ${isDragging ? 'is-dragging' : ''} 
    `.trim().replace(/\s+/g, ' ');

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={combinedClassName}
        >
            {isDragging ? (
                <div
                    className="blue-caret"
                    style={{
                        width: '3px',
                        height: '1.5em',
                        backgroundColor: '#2563eb',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        borderRadius: '2px',
                        boxShadow: '0 0 8px rgba(37, 99, 235, 0.8)',
                        margin: '0 6px',
                        animation: 'caretPulse 1s ease-in-out infinite',
                    }}
                />
            ) : children}
        </div>
    );
};
