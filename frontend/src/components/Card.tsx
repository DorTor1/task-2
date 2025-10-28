import classNames from 'classnames';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Card = ({ title, description, actions, children, className }: CardProps) => {
  return (
    <section className={classNames('card', className)}>
      {(title || description || actions) && (
        <header className="card-header">
          <div>
            {title ? <h2 className="card-title">{title}</h2> : null}
            {description ? <p className="card-description">{description}</p> : null}
          </div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
};

