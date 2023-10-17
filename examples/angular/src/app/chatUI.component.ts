import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { SuperflowsModal } from '@superflows/chat-ui-react';
import { createRoot } from 'react-dom/client';

@Component({
  selector: 'app-react-component',
  template: '<div #reactContainer></div>',
})
export class ReactComponentWrapperComponent
  implements OnDestroy, AfterViewInit
{
  @ViewChild('reactContainer', { static: true }) container!: ElementRef;
  // @Input() superflowsApiKey: any; // replace superflowsApiKey with actual prop names of your React component
  // Add more @Input() if your React component accepts more props

  private componentRef: any;
  private root: any;

  constructor() {}

  ngAfterViewInit() {
    this.root = createRoot(this.container.nativeElement);
    this.root.render(
      React.createElement(SuperflowsModal, {
        AIname: 'Superflows',
        open: true,
        setOpen: () => {},
        superflowsApiKey: 'A KEY',
      }), // replace with actual prop names
    );
  }

  ngOnDestroy() {
    this.root.unmount(this.container.nativeElement);
  }
}
