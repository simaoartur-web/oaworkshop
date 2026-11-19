import { useState } from 'react';
import { getTeamInitials, type TeamImage } from '../../data/team';

type AvatarVariant = 'frame' | 'cutout';

const Portrait = ({
    image,
    initials,
    variant,
}: {
    image: TeamImage;
    initials: string;
    variant: AvatarVariant;
}) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

    const isCutout = variant === 'cutout';
    const imageClasses = isCutout
        ? 'team-avatar-image team-avatar-image--cutout absolute inset-x-0 bottom-0 h-full w-full object-contain object-bottom'
        : 'team-avatar-image absolute inset-0 h-full w-full object-cover';

    return (
        <>
            {(!isCutout || status === 'failed') && status !== 'loaded' ? (
                <span className="team-avatar-monogram">{initials}</span>
            ) : null}
            {status !== 'failed' ? (
                <img
                    src={image.src}
                    alt=""
                    width={320}
                    height={400}
                    loading={isCutout ? 'eager' : 'lazy'}
                    decoding="async"
                    className={`${imageClasses} ${status === 'loaded' ? 'is-loaded' : ''}`}
                    style={isCutout ? undefined : { objectPosition: image.objectPosition ?? 'center' }}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('failed')}
                />
            ) : null}
            {!isCutout && status === 'loading' ? <span className="team-avatar-loading" /> : null}
        </>
    );
};

const TeamAvatar = ({
    name,
    image,
    variant = 'frame',
    className = '',
}: {
    name: string;
    image: TeamImage | null;
    variant?: AvatarVariant;
    className?: string;
}) => {
    const src = image?.src.trim();
    const initials = getTeamInitials(name);
    const isCutout = variant === 'cutout';

    return (
        <div
            aria-hidden="true"
            className={`${isCutout ? 'team-avatar-cutout' : 'team-avatar'} relative flex shrink-0 items-center justify-center overflow-hidden font-serif font-normal ${className}`}
        >
            {!isCutout ? (
                <>
                    <span className="team-avatar-glow" />
                    <span className="team-avatar-grid" />
                </>
            ) : null}
            {src ? (
                <Portrait key={src} image={{ ...image, src }} initials={initials} variant={variant} />
            ) : (
                <span className="team-avatar-monogram">{initials}</span>
            )}
        </div>
    );
};

export default TeamAvatar;
