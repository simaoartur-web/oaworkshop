import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveProjectDetail } from '../../data/projects';
import { getHomePrefix, getLocalizedInternalLink } from '../../seo/routes';

interface ModalLocationState {
    backgroundLocation?: {
        pathname: string;
        search: string;
        hash: string;
    };
}

export default function PortfolioProjectModal() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();

    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const pointerStartedOutside = useRef(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [closing, setClosing] = useState(false);

    const project = useMemo(
        () => (id ? resolveProjectDetail(id, t) : null),
        [id, t]
    );

    const state = location.state as ModalLocationState | null;
    const backgroundLocation = state?.backgroundLocation;
    const homePrefix = getHomePrefix(location.pathname);
    const standalonePath = id
        ? getLocalizedInternalLink(`/projects/${id}`, location.pathname)
        : homePrefix;
    const contactPath = `${homePrefix}#contact`;

    const dismiss = useCallback(() => {
        if (backgroundLocation) {
            navigate(-1);
        } else {
            navigate(`${homePrefix}#portfolio`, { replace: true });
        }
    }, [backgroundLocation, homePrefix, navigate]);

    const requestClose = useCallback(() => {
        if (closeTimer.current) return;
        if (reducedMotion) {
            dismiss();
            return;
        }
        setClosing(true);
        closeTimer.current = setTimeout(dismiss, 180);
    }, [dismiss, reducedMotion]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const bodyOverflow = document.body.style.overflow;
        const bodyPadding = document.body.style.paddingRight;
        const gutter = window.innerWidth - document.documentElement.clientWidth;
        const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;

        document.body.style.paddingRight = `${padding + gutter}px`;
        document.body.style.overflow = 'hidden';

        if (!dialog.open) {
            dialog.showModal();
        }
        closeRef.current?.focus({ preventScroll: true });

        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
            if (dialog.open) dialog.close();
            document.body.style.overflow = bodyOverflow;
            document.body.style.paddingRight = bodyPadding;
            if (previouslyFocused?.isConnected) {
                previouslyFocused.focus({ preventScroll: true });
            }
        };
    }, []);

    const isOutside = (x: number, y: number) => {
        const bounds = dialogRef.current?.getBoundingClientRect();
        return Boolean(
            bounds &&
                (x < bounds.left ||
                    x > bounds.right ||
                    y < bounds.top ||
                    y > bounds.bottom)
        );
    };

    const metadataRows = project
        ? ([
              [t('projectDetail.location'), project.location],
              [t('projectDetail.date'), project.date],
              [t('projectDetail.client'), project.client],
              [t('projectDetail.area'), project.area],
              [t('projectDetail.category'), project.category],
          ].filter((entry): entry is [string, string] => Boolean(entry[1])))
        : [];

    if (typeof document === 'undefined') return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            aria-labelledby="portfolio-modal-title"
            className="portfolio-modal"
            data-closing={closing || undefined}
            onCancel={(event) => {
                event.preventDefault();
                requestClose();
            }}
            onClose={() => {
                if (!dialogRef.current?.open) dismiss();
            }}
            onPointerDown={(event) => {
                pointerStartedOutside.current = isOutside(event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
                if (
                    pointerStartedOutside.current &&
                    isOutside(event.clientX, event.clientY)
                ) {
                    requestClose();
                }
                pointerStartedOutside.current = false;
            }}
            onKeyDown={(event) => {
                if (event.key !== 'Tab') return;
                const controls = Array.from(
                    event.currentTarget.querySelectorAll<HTMLElement>(
                        'button, a[href], input, select, textarea, [tabindex]'
                    )
                ).filter(
                    (element) =>
                        element.tabIndex >= 0 &&
                        !element.hasAttribute('disabled') &&
                        element.getClientRects().length > 0
                );
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }}
        >
            <header className="portfolio-modal-header">
                <div className="flex items-center gap-4 min-w-0">
                    <img
                        src="/logo.png"
                        alt="O+A"
                        className="oa-logo-white h-8 sm:h-10 w-auto object-contain shrink-0"
                    />
                    {project?.category && (
                        <span className="truncate text-[10px] sm:text-xs uppercase tracking-[0.22em] text-gray-400">
                            {project.category}
                        </span>
                    )}
                </div>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={requestClose}
                    aria-label={t('projectDetail.closeModal')}
                    className="portfolio-modal-close"
                >
                    <X size={22} strokeWidth={1.6} aria-hidden="true" />
                </button>
            </header>

            <div className="portfolio-modal-body">
                {!project ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
                        <p className="text-lg font-light text-gray-300">
                            {t('common.notFoundProject')}
                        </p>
                        <button
                            type="button"
                            onClick={requestClose}
                            className="min-h-[44px] border border-white/25 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-white hover:border-[#ED7D31]"
                        >
                            {t('projectDetail.back')}
                        </button>
                    </div>
                ) : (
                    <div className="portfolio-modal-layout">
                        <div className="portfolio-modal-media">
                            {project.imageIsPlaceholder ? (
                                <div
                                    className="portfolio-card-placeholder"
                                    role="img"
                                    aria-label={`${project.title} — ${t('portfolio.placeholderLabel')}`}
                                >
                                    <div
                                        className="portfolio-placeholder-badge"
                                        aria-hidden="true"
                                    >
                                        <span className="portfolio-placeholder-mark">?</span>
                                    </div>
                                </div>
                            ) : (
                                <picture>
                                    {project.imageWebp && (
                                        <source srcSet={project.imageWebp} type="image/webp" />
                                    )}
                                    <img
                                        src={project.mainImage}
                                        alt={project.imageAlt}
                                        className="portfolio-modal-img"
                                    />
                                </picture>
                            )}
                        </div>

                        <div className="portfolio-modal-details">
                            <div className="portfolio-modal-main">
                                <h2
                                    id="portfolio-modal-title"
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white leading-tight"
                                >
                                    {project.title}
                                </h2>

                                <p className="mt-5 text-base sm:text-lg font-light leading-relaxed text-gray-300">
                                    {project.description || t('projectDetail.pendingSheetNote')}
                                </p>

                                {project.scope && project.scope.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {project.scope.map((item) => (
                                            <span
                                                key={item}
                                                className="border border-white/15 px-3 py-1.5 text-xs text-gray-300"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {metadataRows.length > 0 && (
                                <aside className="portfolio-modal-meta">
                                    <dl className="grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-5">
                                        {metadataRows.map(([label, value]) => (
                                            <div key={label}>
                                                <dt className="text-[10px] uppercase tracking-[0.22em] text-[#ED7D31]">
                                                    {label}
                                                </dt>
                                                <dd className="mt-1 text-sm sm:text-base font-light text-white break-words">
                                                    {value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </aside>
                            )}
                        </div>

                        <div className="portfolio-modal-footer">
                            <Link
                                to={standalonePath}
                                className="inline-flex min-h-[44px] items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#ED7D31] focus-visible:outline-offset-4"
                            >
                                <span>{t('projectDetail.openStandalone')}</span>
                                <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" className="text-[#ED7D31]" />
                            </Link>

                            <Link
                                to={contactPath}
                                className="inline-flex min-h-[44px] items-center justify-center bg-white px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-black-900 hover:bg-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#ED7D31] focus-visible:outline-offset-4"
                            >
                                {t('projectDetail.requestProposal')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </dialog>,
        document.body
    );
}
