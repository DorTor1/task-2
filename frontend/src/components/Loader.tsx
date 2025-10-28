interface LoaderProps {
  size?: number;
  text?: string;
}

export const Loader = ({ size = 48, text }: LoaderProps) => {
  const style = { width: size, height: size } as const;
  return (
    <div className="loader">
      <span className="loader-spinner" style={style} aria-hidden="true" />
      {text ? <p className="loader-text">{text}</p> : null}
    </div>
  );
};

