# HPB Datepicker - An angular datepicker

[![N|Solid](https://s3.amazonaws.com/heelum.com/assets/img/datepicker.jpg)](https://nodesource.com/products/nsolid)


# Requirements
Animations requiere Gsap
```sh
<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/TweenMax.min.js"></script>   
```

Also momentjs is necesary
```sh
"dependencies": {
    ...
    "moment": "^2.18.1",
    ...
  },
```

### Installation

```sh
$ npm install hpb-datepicker --save
```

### Usage
Import in your module

```sh
import { HsdpComponent } from 'hpb-datepicker/hsdp.component';

@NgModule({
    declarations: [
        ...
        HsdpComponent,
        ...
    ],
    ...
})
```

Use as a directive

```sh
<h-hsdp (outputEvents)="selectDatePicker($event)"
        [options]="dpOptions" 
        [showYearPicker]="true" 
        [position]="'top'"
        [mainColor]="'#D0A368'"></h-hsdp>
```

### Inputs

| Input | Default |  Type | Required |
| ------ | ------ | ------ | ------ |
| inputEvents | - | event | no |
| options | - | DatePickerOptions class | no |
| mainColor | #6AB7FC | string | no |
| position | default | string | no |
| showYearPicker | false | boolean | no |

DatePickerOptions Class (hsdp.component.ts line 51)
```sh
export class DatePickerOptions {
    autoApply?: boolean;
    style?: 'normal' | 'big' | 'bold';
    locale?: string;
    minDate?: Date;
    maxDate?: Date;
    initialDate?: Date | string;
    firstWeekdaySunday?: boolean;
    format?: string;

    constructor(obj?: IDatePickerOptions) {
        this.autoApply = (obj && obj.autoApply === true) ? true : false;
        this.style = obj && obj.style ? obj.style : 'normal';
        this.locale = obj && obj.locale ? obj.locale : 'es';
        this.minDate = obj && obj.minDate ? obj.minDate : null;
        this.maxDate = obj && obj.maxDate ? obj.maxDate : null;
        this.initialDate = obj && obj.initialDate ? obj.initialDate : null;
        this.firstWeekdaySunday = obj && obj.firstWeekdaySunday ? obj.firstWeekdaySunday : false;
        this.format = obj && obj.format ? obj.format : 'DD [de] MMMM';
        
    }
}
```


### Outputs

| Input | Default |  Type | Required |
| ------ | ------ | ------ | ------ |
| outputEvents | - | event | no |

### Credits

This is an adaptation of [this awesome datepicker](https://github.com/jkuri/ng2-datepicker)

License
----

MIT
