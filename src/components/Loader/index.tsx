import styles from './styles.module.scss';

interface LoaderProps {
  isLoading: boolean;
}

export function Loader({ isLoading }: LoaderProps): JSX.Element {
  return (
    <div
      className={`${styles.dotTyping} ${isLoading ? styles.animated : ''}`}
    />
  );
}
