import { cloneNode } from '../../src/clone-node'

describe('clone node callback', () => {
  it('decorates copied elements after styles and children are cloned', async () => {
    const original = document.createElement('div')
    original.style.color = 'rgb(255, 0, 0)'
    original.innerHTML = '<span>Original text</span>'
    document.body.appendChild(original)
    const seen: HTMLElement[] = []
    try {
      const copy = await cloneNode(original, {
        onCloneNode(source, cloned) {
          expect(cloned).not.toBe(source)
          seen.push(source)
          if (source === original) {
            expect(cloned.style.color).toBe('rgb(255, 0, 0)')
            expect(cloned.querySelector('span')).not.toBeNull()
            cloned.setAttribute('data-capture', 'copy')
          } else {
            cloned.textContent = 'Copied text'
          }
        },
      })
      if (!copy) throw new Error('Expected an element copy')
      expect(seen).toEqual([
        original.firstElementChild as HTMLElement,
        original,
      ])
      expect(copy.getAttribute('data-capture')).toBe('copy')
      expect(copy.textContent).toBe('Copied text')
      expect(original.getAttribute('data-capture')).toBeNull()
      expect(original.textContent).toBe('Original text')
    } finally {
      original.remove()
    }
  })

  it('clones normally when no callback is supplied', async () => {
    const original = document.createElement('div')
    original.textContent = 'Unchanged'
    expect((await cloneNode(original, {}))?.textContent).toBe('Unchanged')
  })
})
