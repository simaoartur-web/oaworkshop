import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { WorkshopAreaId } from './WorkshopSection';

export interface WorkshopTabItem {
    id: WorkshopAreaId;
    label: string;
    tag: string;
    desc: string;
}

interface WorkshopTabsProps {
    items: readonly WorkshopTabItem[];
    activeId: WorkshopAreaId;
    cycleId: number;
    durationMs: number;
    isAutoPlaying: boolean;
    reducedMotion: boolean;
    label: string;
    onSelect: (id: WorkshopAreaId) => void;
    onIntent?: (id: WorkshopAreaId) => void;
}

export default function WorkshopTabs({
    items,
    activeId,
    cycleId,
    durationMs,
    isAutoPlaying,
    reducedMotion,
    label,
    onSelect,
    onIntent,
}: WorkshopTabsProps) {
    const [focusedId, setFocusedId] = useState<WorkshopAreaId | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);
    const activeIndex = items.findIndex((item) => item.id === activeId);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        let next: number;
        switch (event.key) {
            case 'ArrowRight':
                next = (index + 1) % items.length;
                break;
            case 'ArrowLeft':
                next = (index - 1 + items.length) % items.length;
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = items.length - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        const nextItem = items[next];
        buttons.current[next]?.focus({ preventScroll: true });
        onSelect(nextItem.id);
    };

    return (
        <div
            ref={listRef}
            className="workshop-tabs"
            role="tablist"
            aria-label={label}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setFocusedId(null);
                }
            }}
        >
            {items.map((item, index) => {
                const isSelected = activeId === item.id;
                const progressState =
                    index < activeIndex
                        ? 'completed'
                        : isSelected
                          ? reducedMotion
                              ? 'static'
                              : isAutoPlaying
                                ? 'filling'
                                : 'idle'
                          : 'upcoming';

                return (
                    <button
                        key={item.id}
                        ref={(element) => {
                            buttons.current[index] = element;
                        }}
                        id={`workshop-tab-${item.id}`}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        aria-controls={`workshop-panel-${item.id}`}
                        tabIndex={(focusedId ?? activeId) === item.id ? 0 : -1}
                        className="workshop-tab"
                        onClick={() => onSelect(item.id)}
                        onPointerEnter={() => onIntent?.(item.id)}
                        onFocus={() => {
                            setFocusedId(item.id);
                            onIntent?.(item.id);
                        }}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                    >
                        <span className="workshop-tab-header">
                            <span className="workshop-tab-plus" aria-hidden="true">
                                +
                            </span>
                            <span className="workshop-tab-label">{item.label}</span>
                        </span>
                        <span className="workshop-tab-line" aria-hidden="true">
                            <span
                                key={
                                    progressState === 'filling'
                                        ? `${item.id}-${cycleId}-run`
                                        : `${item.id}-${progressState}`
                                }
                                className="workshop-tab-line-fill"
                                data-progress={progressState}
                                style={
                                    {
                                        '--workshop-slide-duration': `${durationMs}ms`,
                                    } as CSSProperties
                                }
                            />
                        </span>
                        <span className="workshop-tab-body">
                            <span className="workshop-tab-tag">{item.tag}</span>
                            <span className="workshop-tab-desc">{item.desc}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
