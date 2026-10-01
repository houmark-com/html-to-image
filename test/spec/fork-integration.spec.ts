import { toSvg } from '../../src/index'
import { getStyleProperties } from '../../src/util'
import { getSvgDocument } from './helper'

describe('fork capture integration', () => {
  it('advertises its clone and per-node style capability', () => {
    expect(
      Object.getOwnPropertyDescriptor(getStyleProperties, 'supportsNodeStyles')
        ?.value,
    ).toBe(true)
  })

  it('combines callbacks, per-node selections, fragments, and later captures', async () => {
    const original = document.createElement('div')
    const stylesheet = document.createElement('style')
    stylesheet.textContent =
      '@layer capture-fixture{.fork-root{width:300px}.fork-card{width:100px;height:40px;margin-inline:auto;clip-path:url(#local-clip)}}'
    original.className = 'fork-root'
    original.innerHTML = '<div class="fork-card">Card</div>'
    document.head.appendChild(stylesheet)
    document.body.appendChild(original)
    const child = original.firstElementChild as HTMLElement
    try {
      const svg = await toSvg(original, {
        skipFonts: true,
        stylePropertiesForNode: () => [],
        onCloneNode(node, copy) {
          if (node === original) copy.style.width = '300px'
          if (node === child) {
            copy.style.cssText =
              'width:100px;height:40px;margin-inline:auto;clip-path:url(#local-clip)'
            copy.setAttribute('data-decorated', 'true')
          }
        },
      })
      const parsed = await getSvgDocument(svg)
      const card = parsed.querySelector('.fork-card') as HTMLElement
      expect(card.getAttribute('data-decorated')).toBe('true')
      expect(card.style.marginInline).toBe('auto')
      expect(card.style.clipPath).toContain('#local-clip')
      expect(child.hasAttribute('data-decorated')).toBe(false)
      const full = await getSvgDocument(
        await toSvg(original, { skipFonts: true }),
      )
      const fullCard = full.querySelector('.fork-card') as HTMLElement
      expect(fullCard.style.width).toBe('100px')
      expect(fullCard.style.height).toBe('40px')
    } finally {
      original.remove()
      stylesheet.remove()
    }
  })
})
