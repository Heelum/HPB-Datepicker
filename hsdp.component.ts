import { Component, ElementRef, Inject, OnInit, forwardRef, Input, Output, EventEmitter, Provider, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

declare var TimelineMax: any;
declare var Elastic: any;
declare var Expo: any;
declare var Circ: any;


const Moment: any = (<any>moment).default || moment;

export interface IDateModel {
    day: string;
    month: string;
    year: string;
    formatted: string;
    momentObj: moment.Moment;
}

export class DateModel {
    day: string;
    month: string;
    year: string;
    formatted: string;
    momentObj: moment.Moment;

    constructor(obj?: IDateModel) {
        this.day = obj && obj.day ? obj.day : null;
        this.month = obj && obj.month ? obj.month : null;
        this.year = obj && obj.year ? obj.year : null;
        this.formatted = obj && obj.formatted ? obj.formatted : null;
        this.momentObj = obj && obj.momentObj ? obj.momentObj : null;
    }
}

export interface IDatePickerOptions {
    autoApply?: boolean;
    style?: 'normal' | 'big' | 'bold';
    locale?: string;
    minDate?: Date;
    maxDate?: Date;
    initialDate?: Date | string;
    firstWeekdaySunday?: boolean;
    format?: string;
}

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

export interface CalendarDate {
    day: number;
    month: number;
    year: number;
    enabled: boolean;
    today: boolean;
    selected: boolean;
    momentObj: moment.Moment;
}

export const CALENDAR_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HsdpComponent),
    multi: true
};


@Component({
    selector: 'h-hsdp',
    templateUrl: './hsdp.component.html',
    styleUrls: ['./hsdp.component.scss'],
    providers: [CALENDAR_VALUE_ACCESSOR]
})


export class HsdpComponent implements ControlValueAccessor, OnInit {
    
    firstTime = true;
    _mainColor: string;

    
    @Input ()
    set updateLabel(value: any){

        if (!this.firstTime && value) {
            let format = this.showYearPicker ? Moment(value).format('DD [de] MMMM [de] YYYY'):Moment(value).format('DD [de] MMMM');
            if(this.date.formatted != format) {
                this.date.formatted = format;
                this.currentDate = Moment(value);
            }
        }
    }
    

    //possible inputs: 'top' - if left empty it will be defaulted to bottom
    @Input() position: string;
    //color input

    @Input() options: DatePickerOptions;
    @Input() inputEvents: EventEmitter<{ type: string, data: string | DateModel }>;
    @Input() showYearPicker: boolean = false;

    @Output() outputEvents: EventEmitter<{ type: string, data: string | DateModel }>;

    @ViewChild('datepickerBody') datepickerBody: ElementRef;

    @ViewChild('calCont') calCont: ElementRef;
    @ViewChild('calInn') calInn: ElementRef;

    @ViewChild('monthTitle') monthTitle: ElementRef;

    @Input ()
    set mainColor(color: string){
        this._mainColor = color;
    }
    get mainColor() { return this._mainColor; }
    

    date: DateModel;

    opened: boolean;
    currentDate: moment.Moment;
    days: CalendarDate[];
    years: number[];
    yearPicker: boolean;
    

    minDate: moment.Moment | any;
    maxDate: moment.Moment | any;

    private onTouchedCallback: () => void = () => { };
    private onChangeCallback: (_: any) => void = () => { };

    constructor( @Inject(ElementRef) public el: ElementRef) {
        this.opened = false;
        this.currentDate = Moment();
        
        this.position = this.position || 'default';
        this.options = this.options || {};
        this.days = [];
        this.years = [];
        this.date = new DateModel({
            day: null,
            month: null,
            year: null,
            formatted: null,
            momentObj: null
        });

        this.outputEvents = new EventEmitter<{ type: string, data: string | DateModel }>();

        if (!this.inputEvents) {
            return;
        }

        this.inputEvents.subscribe((event: { type: string, data: string | DateModel }) => {
            if (event.type === 'setDate') {
                this.value = event.data as DateModel;
            } else if (event.type === 'default') {
                if (event.data === 'open') {
                    this.open();
                } else if (event.data === 'close') {
                    this.close();
                }
            }
        });
  }

    get value(): DateModel {
        return this.date;
    }

    set value(date: DateModel) {
        if (!date) { return; }
        this.date = date;
        this.onChangeCallback(date);
    }

    ngOnInit() {
        
        this.options = new DatePickerOptions(this.options);


        if (this.options.initialDate) {
            
            this.currentDate = Moment(this.options.initialDate);
            this.selectDate(null, this.currentDate);
        }

        if (this.options.minDate instanceof Date) {
            this.minDate = Moment(this.options.minDate);
            this.minDate.subtract(1, 'years');
        } else {
            this.minDate = null;
        }

        if (this.options.maxDate instanceof Date) {
            this.currentDate = Moment(this.options.maxDate);
            this.maxDate = Moment(this.options.maxDate);
            this.maxDate.add(1, 'years');
        } else {
            this.maxDate = null;
        }
        this.generateYears();
        this.generateCalendar();
        this.outputEvents.emit({ type: 'default', data: 'init' });

        if (typeof window !== 'undefined') {
            let body = document.querySelector('body');
            body.addEventListener('click', e => {
                if (!this.opened || !e.target) { return; };
                if (this.el.nativeElement !== e.target && !this.el.nativeElement.contains((<any>e.target))) {
                    this.close();
                }
            }, false);
        }

        if (this.inputEvents) {
            this.inputEvents.subscribe((e: any) => {
                if (e.type === 'action') {
                    if (e.data === 'toggle') {
                        this.toggle();
                    }
                    if (e.data === 'close') {
                        this.close();
                    }
                    if (e.data === 'open') {
                        this.open();
                    }
                }

                if (e.type === 'setDate') {
                    if (!(e.data instanceof Date)) {
                        throw new Error('Input data must be an instance of Date!');
                    }
                    let date: moment.Moment = Moment(e.data);
                    if (!date) {
                    throw new Error('Invalid date: ${e.data}');
                    }
                    this.value = {
                        day: date.format('DD'),
                        month: date.format('MM'),
                        year: date.format('YYYY'),
                        formatted: date.format(this.options.format),
                        momentObj: date
                    };
                }
            });
        }
        this.firstTime = false;
        
        
    }

    shadeColor(color, percent): string{   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    generateCalendar() {

        
        
        
        let date: moment.Moment = Moment(this.currentDate);

        let month = date.month();
        let year = date.year();
        let n = 1;
        let firstWeekDay = (this.options.firstWeekdaySunday) ? date.date(2).day() : date.date(1).day();
        
        if (firstWeekDay !== 0) {
            n -= (firstWeekDay + 7) % 7;
        }

        this.days = [];
        let selectedDate: moment.Moment = this.date.momentObj;

        for (let i = n; i <= date.endOf('month').date(); i += 1) {
            let currentDate: moment.Moment = Moment(`${i}.${month + 1}.${year}`, 'DD.MM.YYYY');
            let today: boolean = (Moment().isSame(currentDate, 'day') && Moment().isSame(currentDate, 'month')) ? true : false;
            let selected: boolean = (selectedDate && selectedDate.isSame(currentDate, 'day')) ? true : false;
            let betweenMinMax = true;

            if (this.minDate !== null) {
                if (this.maxDate !== null) {
                betweenMinMax = currentDate.isBetween(this.minDate, this.maxDate, 'day', '[]') ? true : false;
                } else {
                betweenMinMax = currentDate.isBefore(this.minDate, 'day') ? false : true;
                }
            } else {
                if (this.maxDate !== null) {
                betweenMinMax = currentDate.isAfter(this.maxDate, 'day') ? false : true;
                }
            }

            let day: CalendarDate = {
                day: i > 0 ? i : null,
                month: i > 0 ? month : null,
                year: i > 0 ? year : null,
                enabled: i > 0 ? betweenMinMax : false,
                today: i > 0 && today ? true : false,
                selected: i > 0 && selected ? true : false,
                momentObj: currentDate
            };

            this.days.push(day);
        }
    }

    selectDate(e: MouseEvent, date: moment.Moment) {
        
        if (e) { e.preventDefault(); }
        
        setTimeout(() => {
            let formatted;
            if(this.options.format) {
                formatted = date.format(this.options.format);    
            }else{
                formatted = this.showYearPicker ? date.format('DD [de] MMMM [de] YYYY'):date.format('DD [de] MMMM');
            }
            this.value = {
                day: date.format('DD'),
                month: date.format('MM'),
                year: date.format('YYYY'),
                formatted: formatted,
                momentObj: date
            };
            this.generateCalendar();
            this.outputEvents.emit({ type: 'dateChanged', data: this.value });
        });

        this.close();
    }

    selectYear(e: MouseEvent, year: number) {
        
        e.preventDefault();

        setTimeout(() => {
            
            let date: moment.Moment = this.currentDate.year(year);
            let formatted;
            if(this.options.format) {
                formatted = date.format(this.options.format);    
            }else{
                formatted = this.showYearPicker ? date.format('DD [de] MMMM [de] YYYY'):date.format('DD [de] MMMM');
            }
            this.value = {
                day: date.format('DD'),
                month: date.format('MM'),
                year: date.format('YYYY'),
                formatted: formatted,
                momentObj: date
            };
            
            this.yearPicker = false;
            this.generateCalendar();
        });
    }

    generateYears() {
        
        let date: moment.Moment = this.options.minDate ? Moment(this.options.minDate): Moment().year(Moment().year() - 5);
        let toDate: moment.Moment = this.options.maxDate ? Moment(this.options.maxDate): Moment().year(Moment().year() + 20);
        let years = toDate.year() - date.year();

        for (let i = 0; i <= years; i++) {
            this.years.push(date.year());
            date.add(1, 'year');
        }
    }

    writeValue(date: DateModel) {
        if (!date) { return; }
        this.date = date;
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    prevMonth() {

        let anim = new TimelineMax();

        anim
            .to(this.monthTitle.nativeElement, 0.3, {x: '100%', opacity: 0, ease: Expo.easeInOut}, 0)
            .to(this.calInn.nativeElement, 0.3, {x: '100%', opacity: 0, ease: Expo.easeInOut}, 0)
            .set(this.monthTitle.nativeElement, {x: '-100%'})
            .set(this.calInn.nativeElement, {x: '-100%'})
            .to(this.monthTitle.nativeElement, 0.3, {x: '0%', opacity: 1, ease: Expo.easeInOut}, 0.4)
            .to(this.calInn.nativeElement, 0.3, {x: '0%', opacity: 1, ease: Expo.easeInOut}, 0.4)

        setTimeout(() => {
            this.currentDate = this.currentDate.subtract(1, 'month');
            this.generateCalendar();
        }, 300)

    }

    nextMonth() {
        
       let anim = new TimelineMax();

        anim
            .to(this.monthTitle.nativeElement, 0.3, {x: '-100%', opacity: 0, ease: Expo.easeInOut}, 0)
            .to(this.calInn.nativeElement, 0.3, {x: '-100%', opacity: 0, ease: Expo.easeInOut}, 0)
            .set(this.monthTitle.nativeElement, {x: '100%'})
            .set(this.calInn.nativeElement, {x: '100%'})
            .to(this.monthTitle.nativeElement, 0.3, {x: '0%', opacity: 1, ease: Expo.easeInOut}, 0.4)
            .to(this.calInn.nativeElement, 0.3, {x: '0%', opacity: 1, ease: Expo.easeInOut}, 0.4)

        setTimeout(() => {
            this.currentDate = this.currentDate.add(1, 'month');
            this.generateCalendar();
        }, 300)

    }

    today() {
        this.currentDate = Moment();
        this.selectDate(null, this.currentDate);
    }

    toggle() {
        let anim = new TimelineMax();

        if (this.position == 'top') {
            this.opened = !this.opened;
                    
            setTimeout(()=>{
                try{
                    anim.to(this.datepickerBody.nativeElement, 0.4, {y: '-105%', opacity: 1});
                     if (this.opened) {
                        this.onOpen();
                    }
                }catch(e){
                    console.log('element invisible')
                }
                
            }, 100)


            this.outputEvents.emit({ type: 'default', data: 'opened' });
        }
        else{
            this.opened = !this.opened;
                    
            setTimeout(()=>{
                try{
                    anim.to(this.datepickerBody.nativeElement, 0.4, {y: '-45%', opacity: 1});
                     if (this.opened) {
                        this.onOpen();
                    }
                }catch(e){
                    console.log('element invisible')
                }
                
            }, 100)


            this.outputEvents.emit({ type: 'default', data: 'opened' });
        }

        
    }

    open() {
        this.opened = true;
        this.onOpen();
    }

    close() {
        let anim = new TimelineMax();

        try{
            anim.to(this.datepickerBody.nativeElement, 0.4, {y: '-25%', opacity: 0});
        }catch(e){
            // console.log('element invisible')
        }
        

        setTimeout(() =>{
            this.opened = false;    
            this.outputEvents.emit({ type: 'default', data: 'closed' });
        }, 450)
        
    }

    onOpen() {
        this.yearPicker = false;
    }

    openYearPicker() {
        let anim = new TimelineMax();
        setTimeout(() => {
            anim.to(this.calCont.nativeElement, 1, {scrollTo: 1000, ease: Expo.easeInOut});
        }, 50)

        setTimeout(() => this.yearPicker = true);
    }

    showPlaceholder(){
        if(this.date.formatted == null) {
            return true;
        }
        else{
            return false;
        }
    }

    hoverArrowF(state: number){
        let anim = new TimelineMax();

        if (state == 0) {
            anim   
                .to(this.calInn.nativeElement, 0.61, {x: '-5%', ease: Elastic.easeOut.config(1, 0.4)});
        }
        else{
            anim   
                .to(this.calInn.nativeElement, 0.61, {x: '0%', ease: Elastic.easeOut.config(1, 0.4)});
        }

    }

    hoverArrowB(state: number){
        let anim = new TimelineMax();

        if (state == 0) {
            anim   
                .to(this.calInn.nativeElement, 0.61, {x: '5%', ease: Elastic.easeOut.config(1, 0.4)});
        }
        else{
            anim   
                .to(this.calInn.nativeElement, 0.61, {x: '0%', ease: Elastic.easeOut.config(1, 0.4)});
        }

    }







}