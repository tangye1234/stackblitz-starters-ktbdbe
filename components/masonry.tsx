import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef
} from 'react'
import styled, { css } from 'styled-components'
import { useLayoutEffect } from './use-layout-effect'

export type Breakpoint<T> = {
  [key: number]: T
  default?: T
}

interface MasonryBaseProps {
  columns?: number | Breakpoint<number>
  spacing?: number | Breakpoint<number>
  defaultHeight?: number
  disableSSR?: boolean
}

type MasonryInnerProps = MasonryBaseProps &
  React.ComponentProps<'div'> & { as: any }
type MasonryRootType = ReturnType<typeof styled.div<MasonryBaseProps>>

type MasonryRootState = {
  spacing: (readonly [number, number])[]
  columns: (readonly [number, number])[]
  ssr: boolean
}

const LineBreaks = styled.span<{ $order: number }>`
  flex-basis: 100%;
  width: 0;
  margin: 0;
  padding: 0;
  order: ${props => props.$order || 'unset'};
`

const MasonryRoot = styled.div<{ $state: MasonryRootState }>`
  display: flex;
  flex-flow: column wrap;
  align-content: flex-start;
  contain: ${({ $state }) => ($state.ssr ? 'none' : 'strict')};
  height: var(--masonry-height, 'auto');

  ${({ $state: { spacing } }) =>
    spacing.map(([breakpoint, spacing]) =>
      breakpoint === -1
        ? css`
            --masonry-spacing: ${spacing}px;
          `
        : css`
            @media screen and (max-width: ${breakpoint}px) {
              --masonry-spacing: ${spacing}px;
            }
          `
    )}

  ${({ $state: { columns } }) =>
    columns.map(([breakpoint, column]) =>
      breakpoint === -1
        ? css`
            --masonry-column: ${column};
          `
        : css`
            @media screen and (max-width: ${breakpoint}px) {
              --masonry-column: ${column};
            }
          `
    )}

  margin: calc(var(--masonry-spacing, 0px) / -2);

  & > :not(template, ${LineBreaks}, [hidden]) {
    margin: calc(var(--masonry-spacing, 0px) / 2);
    width: calc(
      (1 / var(--masonry-column, 1)) * 100% - var(--masonry-spacing, 0px)
    );
    order: calc(1 + var(--masonry-column, 1));
  }

  ${({ $state }) =>
    $state.ssr &&
    css`
      & > :not(template, ${LineBreaks}, [hidden]) {
        display: none;
      }
    `}
`

function ptn(val: string) {
  return Number(val.replace('px', ''))
}

const Masonry = forwardRef<HTMLElement, MasonryInnerProps>(
  function Masonry(
    {
      children,
      className,
      as = 'div',
      columns = 1,
      spacing = 0,
      defaultHeight = 0,
      disableSSR = false,
      ...rest
    },
    ref
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const masonryRef = useRef<HTMLElement>(null!)
    useImperativeHandle(ref, () => masonryRef.current)

    const [isSSR, setSSR] = useState(!disableSSR)
    useEffect(() => () => setSSR(false), [])

    const maxColumnHeightRef = useRef(defaultHeight)
    const maxColumnHeight = maxColumnHeightRef.current

    const maxColumnCount =
      typeof columns === 'number'
        ? columns
        : Math.max(...Object.values(columns))

    const state = useMemo<MasonryRootState>(
      () => ({
        ssr: isSSR,
        columns: _entries(columns),
        spacing: _entries(spacing)
      }),
      [isSSR, columns, spacing]
    )

    useLayoutEffect(() => {
      if (typeof ResizeObserver === 'undefined') {
        return
      }

      if (typeof MutationObserver === 'undefined') {
        return
      }

      /**
       * FIXME safari will trigger `ResizeObserver loop completed
       * with undelivered notifications` error in console
       **/
      const resizeObserver = new ResizeObserver(() => {
        resizeObserver.unobserve(masonryRef.current)
        const result = handleResize(masonryRef.current, true)
        const { height = 0 } = result || {}
        maxColumnHeightRef.current = height
        masonryRef.current.style.setProperty(
          '--masonry-height',
          height ? `${height}px` : 'auto'
        )
      })

      if (masonryRef.current) {
        masonryRef.current.childNodes.forEach(child => {
          if (child instanceof Element) {
            resizeObserver.observe(child as Element)
          }
        })
      }

      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type !== 'childList') {
            return
          }
          mutation.addedNodes.forEach(node => {
            if (node instanceof Element) {
              resizeObserver.observe(node)
            }
          })
          mutation.removedNodes.forEach(node => {
            if (node instanceof Element) {
              resizeObserver.unobserve(node)
            }
          })
          if (
            mutation.addedNodes.length === 0 &&
            mutation.removedNodes.length > 0
          ) {
            // this situation won't trigger resizeObserver callback, so
            // manually trigger it here
            resizeObserver.observe(masonryRef.current)
          }
        })
      })

      mutationObserver.observe(masonryRef.current, {
        childList: true,
        subtree: false,
        attributes: false,
        characterData: false
      })

      return () => {
        resizeObserver.disconnect()
        mutationObserver.disconnect()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <MasonryRoot
        {...rest}
        as={as}
        ref={masonryRef as React.Ref<HTMLDivElement>}
        className={className}
        $state={state}
        style={{
          ...rest.style,
          '--masonry-height': maxColumnHeight ? `${maxColumnHeight}px` : 'auto'
        }}
      >
        {children}
        {new Array(maxColumnCount - 1).fill('').map((_, index) => (
          <LineBreaks key={index} data-class="line-break" $order={index + 1} />
        ))}
      </MasonryRoot>
    )
  }
) as MasonryRootType

function handleResize(masonry: HTMLElement | undefined, isResize = false) {
  if (!masonry || masonry.childElementCount === 0) {
    return
  }

  const masonryFirstChild = masonry.firstElementChild
  const parentWidth = masonry.clientWidth
  const firstChildWidth = masonryFirstChild?.clientWidth || 0

  if (parentWidth === 0 || firstChildWidth === 0 || !masonryFirstChild) {
    return
  }

  const firstChildComputedStyle = getComputedStyle(masonryFirstChild)
  const firstChildMarginLeft = ptn(firstChildComputedStyle.marginLeft)
  const firstChildMarginRight = ptn(firstChildComputedStyle.marginRight)

  const currentNumberOfColumns = Math.round(
    parentWidth /
      (firstChildWidth + firstChildMarginLeft + firstChildMarginRight)
  )

  const columnHeights = new Array(currentNumberOfColumns).fill(0) as number[]
  let skip = false

  masonry.childNodes

  masonry.childNodes.forEach(child => {
    if (
      !(child instanceof HTMLElement) ||
      child.dataset.class === 'line-break' ||
      skip
    ) {
      return
    }

    const childComputedStyle = getComputedStyle(child)
    const childMarginTop = ptn(childComputedStyle.marginTop)
    const childMarginBottom = ptn(childComputedStyle.marginBottom)
    const parsedChildHeight = ptn(childComputedStyle.height)
    const childHeight = parsedChildHeight
      ? Math.ceil(parsedChildHeight) + childMarginTop + childMarginBottom
      : 0

    if (childHeight === 0) {
      // if any one of children isn't rendered yet, masonry's height shouldn't be computed yet
      skip = true
      return
    }

    // if there is a nested image that isn't rendered yet, masonry's height shouldn't be computed yet
    for (let i = 0; i < child.childNodes.length; i += 1) {
      const nestedChild = child.childNodes[i] as Element
      if (nestedChild.tagName === 'IMG' && nestedChild.clientHeight === 0) {
        skip = true
        break
      }
    }

    if (!skip) {
      // find the current shortest column (where the current item will be placed)
      const currentMinColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      )

      if (isResize) {
        const oldOrder = Number(child.style.order)
        const newOrder = currentMinColumnIndex + 1
        if (isFinite(oldOrder) && oldOrder !== newOrder) {
          /** debounce order change for 5px difference */
          if (
            Math.abs(
              columnHeights[oldOrder - 1] - columnHeights[newOrder - 1]
            ) < 5
          ) {
            columnHeights[oldOrder - 1] += childHeight
            return
          }
        }
      }

      columnHeights[currentMinColumnIndex] += childHeight
      const order = currentMinColumnIndex + 1
      child.style.order = String(order)
    }
  })

  if (!skip) {
    const numOfLineBreaks =
      currentNumberOfColumns > 0 ? currentNumberOfColumns - 1 : 0
    return {
      height: Math.max(...columnHeights),
      numOfLineBreaks
    }
  }
}

export { Masonry }

function _entries(values: Breakpoint<number> | number) {
  return Object.entries(
    typeof values === 'number' ? { default: values } : values
  )
    .reverse()
    .map(
      ([breakpoint, column]) =>
        [
          breakpoint === 'default' ? -1 : parseInt(breakpoint) - 1,
          column
        ] as const
    )
}
