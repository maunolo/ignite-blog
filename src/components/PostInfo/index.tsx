import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import styles from './styles.module.scss';

interface PostInfoProps {
  date?: string;
  author?: string;
  timeToRead?: string;
}

export function PostInfo({
  date,
  author,
  timeToRead,
}: PostInfoProps): JSX.Element {
  return (
    <div className={styles.container}>
      {date && (
        <>
          <FiCalendar />
          <time>
            {format(new Date(date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
        </>
      )}

      {author && (
        <>
          <FiUser />
          <span>{author}</span>
        </>
      )}

      {timeToRead && (
        <>
          <FiClock />
          <span>{timeToRead}</span>
        </>
      )}
    </div>
  );
}
