import { useState } from 'react';
import { getTeamInitials, type TeamImage } from '../../data/team';

const Portrait = ({ image, initials }: { image: TeamImage; initials: string }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
    return (
        <>
            <span className={`team-avatar-monogram ${status === 'loaded' ? 'opacity-0' : ''}`}>
                {initials}
            </span>
            {status !== 'failed' ? (
                <img
                    src={image.src}
                    alt=""
                    width={320}
                    height={400}
                    loading="lazy"
                    className={`team-avatar-image absolute inset-0 h-full w-full object-cover ${status === 'loaded' ? 'is-loaded' : ''}`}
                    style={{ objectPosition: image.objectPosition ?? 'center' }}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('failed')}
                />
            ) : null}
            {status === 'loading' ? <span className="team-avatar-loading" /> : null}
        </>
    );
};

const TeamAvatar = ({
    name,
    image,
    className = '',
}: {
    name: string;
    image: TeamImage | null;
    className?: string;
}) => {
    const src = image?.src.trim();
    const initials = getTeamInitials(name);
    return (
        <div
            aria-hidden="true"
            className={`team-avatar relative flex shrink-0 items-center justify-center overflow-hidden font-serif font-normal ${className}`}
        >
            <span className="team-avatar-glow" />
            <span className="team-avatar-grid" />
            {src ? (
                <Portrait key={src} image={{ ...image, src }} initials={initials} />
            ) : (
                <span className="team-avatar-monogram">{initials}</span>
            )}
        </div>
    );
};

export default TeamAvatar;
