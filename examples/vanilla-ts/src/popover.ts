import * as popover from "@zag-js/popover"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"

export class Popover {
  rootEl: HTMLElement
  service: ReturnType<typeof popover.machine>
  api: popover.Api<any>

  constructor(rootEl: HTMLElement | null, context: popover.Context) {
    if (!rootEl) throw new Error("Root element not found")
    this.rootEl = rootEl

    this.service = popover.machine(context)
    this.api = popover.connect(this.service.state, this.service.send, normalizeProps)
  }

  private disposable = new Map<HTMLElement, VoidFunction>()

  init = () => {
    const { service } = this
    this.render()
    this.service.subscribe(() => {
      this.api = popover.connect(service.state, service.send, normalizeProps)
      this.render()
    })

    this.service.start()
  }

  destroy = () => {
    this.service.stop()
  }

  render = () => {
    this.disposable.forEach((dispose) => dispose())

    const rootEl = this.rootEl

    const triggerEl = rootEl.querySelector<HTMLElement>(".popover-trigger")
    if (triggerEl) {
      this.disposable.set(triggerEl, spreadProps(triggerEl, this.api.triggerProps))
    }

    const contentEl = rootEl.querySelector<HTMLElement>(".popover-content")
    if (contentEl) this.disposable.set(contentEl, spreadProps(contentEl, this.api.contentProps))

    const positionerEl = rootEl.querySelector<HTMLElement>(".popover-positioner")
    if (positionerEl) this.disposable.set(positionerEl, spreadProps(positionerEl, this.api.positionerProps))
  }
}
