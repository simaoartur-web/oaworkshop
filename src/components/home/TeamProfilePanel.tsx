import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TeamMember } from '../../data/team';
import TeamAvatar from './TeamAvatar';

interface Props {
    member: TeamMember;
    onDismiss: () => void;
    returnFocusRef: RefObject<HTMLButtonElement | null>;
    fallbackFocusRef: RefObject<HTMLHeadingElement | null>;
}

const TeamProfilePanel = ({ member, onDismiss, returnFocusRef, fallbackFocusRef }: Props) => {
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const pointerStartedOutside = useRef(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const trigger = returnFocusRef.current;
        const fallback = fallbackFocusRef.current;
        const bodyOverflow = document.body.style.overflow;
        const rootOverflow = document.documentElement.style.overflow;
        const bodyPadding = document.body.style.paddingRight;
        const gutter = window.innerWidth - document.documentElement.clientWidth;
        const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.paddingRight = `${padding + gutter}px`;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        if (!dialog.open) dialog.showModal();
        closeRef.current?.focus({ preventScroll: true });

        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
            if (dialog.open) dialog.close();
            document.body.style.overflow = bodyOverflow;
            document.documentElement.style.overflow = rootOverflow;
            document.body.style.paddingRight = bodyPadding;
            const target = trigger?.isConnected ? trigger : fallback;
            target?.focus({ preventScroll: true });
        };
    }, [returnFocusRef, fallbackFocusRef]);

    const requestClose = useCallback(() => {
        if (closeTimer.current) return;
        if (reducedMotion) {
            onDismiss();
            return;
        }
        setClosing(true);
        closeTimer.current = setTimeout(onDismiss, 220);
    }, [onDismiss, reducedMotion]);

    const outside = (x: number, y: number) => {
        const bounds = dialogRef.current?.getBoundingClientRect();
        return Boolean(bounds && (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom));
    };

    return createPortal(
        <dialog ref={dialogRef} aria-labelledby="team-profile-name" className="team-profile-panel"
            data-closing={closing || undefined}
            onCancel={(event) => { event.preventDefault(); requestClose(); }}
            onClose={() => { if (!dialogRef.current?.open) onDismiss(); }}
            onPointerDown={(event) => { pointerStartedOutside.current = outside(event.clientX, event.clientY); }}
            onPointerUp={(event) => {
                if (pointerStartedOutside.current && outside(event.clientX, event.clientY)) requestClose();
                pointerStartedOutside.current = false;
            }}
            onKeyDown={(event) => {
                if (event.key !== 'Tab') return;
                const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'))
                    .filter((element) => element.tabIndex >= 0 && !element.hasAttribute('disabled') && element.getClientRects().length > 0);
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}>
            <header className="team-panel-header flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-6 py-4 md:px-8">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('team.profile')}</p>
                <button ref={closeRef} type="button" onClick={requestClose} aria-label={t('team.closeProfile')}
                    className="team-panel-close flex h-11 w-11 items-center justify-center text-white">
                    <X size={22} strokeWidth={1.5} aria-hidden="true" />
                </button>
            </header>
            <div className="team-panel-content min-h-0 overflow-y-auto overscroll-contain px-6 py-8 md:px-8">
                <TeamAvatar name={member.name} image={member.image} className="mb-8 aspect-[5/3] w-full text-6xl" />
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-gray-400">{t(member.leadership ? 'team.leadership' : 'team.practice')}</p>
                <h2 id="team-profile-name" className="break-words text-4xl font-light tracking-tight text-white">{member.name}</h2>
                <p className="mt-4 text-base font-light leading-relaxed text-gray-300">{t(`team.roles.${member.role}`)}</p>
                <dl className="mt-8">
                    <dt className="text-xs uppercase tracking-[0.16em] text-gray-400">{t('team.area')}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-gray-300">{t(`team.categories.${member.category}`)}</dd>
                </dl>
                {member.bio && (
                    <section aria-labelledby="team-biography-title" className="mt-8">
                        <h3 id="team-biography-title" className="mb-3 text-xs uppercase tracking-[0.16em] text-gray-400">{t('team.biography')}</h3>
                        <p className="whitespace-pre-line break-words text-base font-light leading-relaxed text-gray-300">{t(`team.bios.${member.bio}`, { defaultValue: '' })}</p>
                    </section>
                )}
            </div>
        </dialog>,
        document.body,
    );
};

export default TeamProfilePanel;
