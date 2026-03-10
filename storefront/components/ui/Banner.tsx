export type BannerSize = 'hero' | 'lg' | 'sm';

interface BannerProps {
  size: BannerSize;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  backgroundImage?: string;
  overlay?: boolean;
}

export const Banner: React.FC<BannerProps> = ({
  size,
  title,
  subtitle,
  cta,
  backgroundImage,
  overlay = true,
}) => {
  const heights: Record<BannerSize, string> = {
    hero: 'banner--hero',
    lg:   'banner--lg',
    sm:   'banner--sm',
  };

  return (
    <section
      className={`banner ${heights[size]}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {overlay && <div className="banner__overlay" />}
      <div className="banner__content container animate-fade-up">
        {size === 'sm' && <p className="banner__eyebrow t-caption">Featured</p>}
        <h2 className={`banner__title ${size === 'hero' ? 't-display-xl' : size === 'lg' ? 't-display-lg' : 't-display-md'}`}>
          {title}
        </h2>
        {subtitle && <p className="banner__subtitle t-body-lg">{subtitle}</p>}
        {cta && (
          <a href={cta.href} className="banner__cta btn btn--outline btn--lg">
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
};