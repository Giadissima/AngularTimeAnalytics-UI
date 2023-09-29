import { ChartFilter, DataChart } from 'src/app/models/chart.dto';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { compareAsc, differenceInDays } from 'date-fns';

import { Color } from '@swimlane/ngx-charts';
import dayData from '../../../../data/today.json';
import monthData from '../../../../data/month.json';
import weekData from '../../../../data/week.json';
import yesterdayData from '../../../../data/yesterday.json';

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit, OnChanges {
  
  @Input() dataAssets: string = '';
  @Input() set setContainer(value: string) {
    this.containerSelected = value;
    this.takeDataFromJsonByFilters();
  }

  // TODO risolvere errore intervallo
  // TODO aggiungere ultima ora
  @Input() set setInterval(value: string) {
    console.log("cambio intervallo", value)
    this.interval = value;
    this.takeDataFromJsonByFilters();
  }
  @Input() color: string = '#ffffff';
  @Input() set dateBegin(value: Date) {
    this.dateBeginSelected = value;
    this.takeDataFromJsonByFilters();
  }
  
  @Input() set dateEnd(value: Date) {
    this.dateEndSelected = value;
    this.takeDataFromJsonByFilters();
  }
  
  interval: string = '2 ora';
  containerSelected: string = '';
  dateBeginSelected!: Date;
  dateEndSelected!: Date;
  barPadding = 20;
  
  colorScheme = {
    domain:[this.color]
  } as Color

  result: any[] = [];
  // ? debugger;

  ngOnInit() {
      this.colorScheme = {
        domain:[this.color]
      } as Color
  }

  takeDataFromJsonByFilters() {
    let int:number = Number(this.interval[0])
    if (
      !this.dateBeginSelected ||
      !this.dateEndSelected ||
      compareAsc(this.dateBeginSelected, this.dateEndSelected) > 0 ||
      this.containerSelected === ''
    ) {
      return;
    }

    const diffInDays = differenceInDays(this.dateEndSelected, this.dateBeginSelected)
    let data: any[] = [];
      // caso caricamento dati giornalieri
    if(diffInDays == 0){
      let day = this.dateBeginSelected.getDay();
      if (day % 2 == 0) {
        // carica i dati di "oggi"
        // console.log("day data")
        data = dayData;
      } else {
        // carica i dati di "ieri"
        // console.log("yesterday data")
        data = yesterdayData;
      }
    } else if(diffInDays == 7 || diffInDays == 6){
      // caso caricamento dati settimanali
        // console.log("week data")
        data = weekData;
    } else {
      // console.log("dati mensili", diffInDays)
      data = monthData;
    }
    this.result = []
    data.forEach((container) => {
// TODO non aggiorna quando viene cambiato l'orario

      console.log("container", container)
      if (
        container &&
        (this.containerSelected == 'Tutti' ||
          this.containerSelected == container.name)
      ) {
        container.series.forEach(
          (item: { people: number; name: string; alarms: number }) => {
            let founded = this.result.find((el) => el.name === item.name);
            if(item.name[12]){
              if(Number(item.name[12]) % int != 0) { return;}
            }
            if (founded !== undefined) {
              founded.value +=
                this.dataAssets == 'people' ? item.people : item.alarms;
            } else {
              this.result.push({
                value: this.dataAssets == 'people' ? item.people : item.alarms,
                name: item.name,
              });
            }
          }
        );
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.takeDataFromJsonByFilters();
  }
}
