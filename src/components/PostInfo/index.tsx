import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import styles from './styles.module.scss';

interface PostInfoProps {
  publicationDate?: string;
  lastUpdateDate?: string;
  author?: string;
  timeToRead?: string;
}

export function PostInfo({
  publicationDate,
  lastUpdateDate,
  author,
  timeToRead,
}: PostInfoProps): JSX.Element {
  return (
    <>
      <div className={styles.container}>
        {publicationDate && (
          <>
            <FiCalendar />
            <time>
              {format(new Date(publicationDate), 'dd MMM yyyy', {
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
      {lastUpdateDate && (
        <span className={styles.lastUpdate}>
          {format(
            new Date(lastUpdateDate),
            "'* editado em' dd MMM yyyy', às' HH:mm",
            {
              locale: ptBR,
            }
          )}
        </span>
      )}
    </>
  );
}
