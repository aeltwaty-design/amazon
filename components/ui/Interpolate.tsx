import { Fragment, type ReactNode } from 'react';
import { splitTemplate } from '@/lib/i18n';

type Props = { template: string; vars: Record<string, ReactNode> };

// fmt() for React nodes: "{email}" becomes a <bdi>, "{terms}" a link, while
// the sentence around them stays exactly as written in the content file.
export function Interpolate({ template, vars }: Props) {
  return (
    <>
      {splitTemplate(template).map((part, i) =>
        'text' in part ? (
          <Fragment key={i}>{part.text}</Fragment>
        ) : (
          <Fragment key={i}>{part.key in vars ? vars[part.key] : `{${part.key}}`}</Fragment>
        ),
      )}
    </>
  );
}
