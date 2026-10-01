import { cloneNode } from '../../src/clone-node'

describe('per-node style property selection', () => {
  it('uses each element selection without leaking it to siblings or descendants', async () => {
    const original = document.createElement('div')
    const stylesheet = document.createElement('style')
    stylesheet.textContent =
      '.node-style-root{width:120px;height:64px;color:red}.node-style-child{height:32px;color:green}.node-style-leaf{color:blue}'
    document.head.appendChild(stylesheet)
    original.className = 'node-style-root'
    original.innerHTML =
      '<div class="node-style-child"><span class="node-style-leaf">Text</span></div>'
    document.body.appendChild(original)
    const child = original.firstElementChild as HTMLElement
    try {
      const copy = await cloneNode(original, {
        stylePropertiesForNode(node) {
          if (node === original) return ['width']
          if (node === child) return ['height']
          return undefined
        },
      })
      if (!copy) throw new Error('Expected an element copy')
      const clonedChild = copy.firstElementChild as HTMLElement
      const clonedLeaf = clonedChild.firstElementChild as HTMLElement
      expect(copy.style.width).toBe('120px')
      expect(copy.style.color).toBe('')
      expect(clonedChild.style.height).toBe('32px')
      expect(clonedChild.style.color).toBe('')
      expect(clonedLeaf.style.color).toBe('rgb(0, 0, 255)')
      expect(getComputedStyle(original).color).toBe('rgb(255, 0, 0)')
    } finally {
      original.remove()
      stylesheet.remove()
    }
  })

  it('supports an empty selection and restores full styles for undefined', async () => {
    const original = document.createElement('div')
    const stylesheet = document.createElement('style')
    stylesheet.textContent = '.node-style-empty{width:120px}'
    document.head.appendChild(stylesheet)
    original.className = 'node-style-empty'
    document.body.appendChild(original)
    try {
      const empty = await cloneNode(original, {
        stylePropertiesForNode: () => [],
      })
      expect(empty?.style.width).toBe('')
      const full = await cloneNode(original, {
        includeStyleProperties: ['color'],
        stylePropertiesForNode: () => undefined,
      })
      expect(full?.style.width).toBe('120px')
    } finally {
      original.remove()
      stylesheet.remove()
    }
  })
})
