import assert from 'node:assert/strict'
import { parseEncarHistoryHtml, parseEncarHistoryRecord } from '../server/lib/encarHistory.js'
import { extractInteriorColorFromPairs, extractInteriorColorFromText } from '../server/lib/vehicleData.js'

const cardFixture = `
  <section>
    <h3>통계</h3>
    <div class="stats">
      <div class="card"><span>사고</span><strong>0</strong></div>
      <div class="card"><span>전손</span><strong>1</strong></div>
      <div class="card"><span>명의변경</span><strong>2</strong></div>
      <div class="card"><span>차량번호 변경</span><strong>0</strong></div>
      <div class="card"><span>내차피해</span><strong>1</strong></div>
      <div class="card"><span>내차피해금액</span><strong>15116570 원</strong></div>
      <div class="card"><span>타차가해</span><strong>2</strong></div>
      <div class="card"><span>타차가해 피해금액</span><strong>691568 원</strong></div>
      <div class="card"><span>도난</span><strong>0</strong></div>
    </div>
  </section>
  <section>
    <h3>무보험 기간</h3>
    <div>기간 1: 202405~202406</div>
    <div>기간 2: 202301~202302</div>
  </section>
  <section>
    <h3>명의변경</h3>
    <div><span>명의변경 1</span><span>19.06.2024</span></div>
    <div><span>명의변경 2</span><span>09.05.2024</span></div>
  </section>
`

const regexFixture = `
  <div>
    Статистика
    Аварии: 3
    Тотальная потеря: 0
    Смены владельцев: 1
    Смены номеров: 0
    По моей вине: 0
    Ущерб (моя вина): 0 ₩
    Не по моей вине: 1
    Ущерб (чужая вина): 250000 ₩
    Кражи: 0
    Период 1: 202405~202406
    Смена владельца 1 - 03.02.2024
  </div>
`

const recordFixture = {
  openData: true,
  regDate: '2026-01-23T09:02:38.983269',
  carNo: '46오8577',
  year: '2014',
  maker: 'Volvo',
  displacement: '1560',
  firstDate: '2014-02-12',
  fuel: '디젤',
  myAccidentCnt: 2,
  otherAccidentCnt: 1,
  ownerChangeCnt: 6,
  robberCnt: 0,
  totalLossCnt: 0,
  government: 0,
  business: 0,
  loan: 0,
  carNoChangeCnt: 0,
  myAccidentCost: 5177340,
  otherAccidentCost: 3559800,
  carInfoChanges: [
    { date: '2014-02-12', carNo: '46오XXXX' },
  ],
  ownerChanges: [
    '2025-01-13',
    '2024-04-01',
  ],
  notJoinDate1: '201902~201911',
  notJoinDate2: '202208~202306',
  accidentCnt: 3,
  accidents: [
    {
      type: '1',
      date: '2023-10-01',
      insuranceBenefit: 3451130,
      partCost: 3211580,
      laborCost: 115810,
      paintingCost: 264550,
    },
  ],
}

function run() {
  const cardParsed = parseEncarHistoryHtml(cardFixture, { sourceUrl: 'fixture://cards' })
  assert.equal(cardParsed.statistics.accidents, 0)
  assert.equal(cardParsed.statistics.totalLoss, 1)
  assert.equal(cardParsed.statistics.ownerChanges, 2)
  assert.equal(cardParsed.statistics.atFaultDamage, 15116570)
  assert.equal(cardParsed.statistics.notAtFaultDamage, 691568)
  assert.equal(cardParsed.uninsuredPeriods.length, 2)
  assert.deepEqual(cardParsed.uninsuredPeriods[0], {
    index: 1,
    raw: '202405~202406',
    start: '2024-05',
    end: '2024-06',
  })
  assert.deepEqual(cardParsed.ownerChanges[0], {
    index: 1,
    date: '2024-06-19',
    rawDate: '19.06.2024',
  })

  const regexParsed = parseEncarHistoryHtml(regexFixture, { sourceUrl: 'fixture://regex' })
  assert.equal(regexParsed.statistics.accidents, 3)
  assert.equal(regexParsed.statistics.notAtFaultCount, 1)
  assert.equal(regexParsed.statistics.notAtFaultDamage, 250000)
  assert.equal(regexParsed.uninsuredPeriods.length, 1)
  assert.equal(regexParsed.ownerChanges.length, 1)
  assert.equal(regexParsed.ownerChanges[0].date, '2024-02-03')

  const recordParsed = parseEncarHistoryRecord(recordFixture, {
    carId: '41396660',
    vehicleNo: '46오8577',
    sourceUrl: 'fixture://record-api',
  })
  assert.equal(recordParsed.pageType, 'record_api')
  assert.equal(recordParsed.statistics.accidents, 3)
  assert.equal(recordParsed.statistics.atFaultCount, 2)
  assert.equal(recordParsed.statistics.notAtFaultDamage, 3559800)
  assert.equal(recordParsed.uninsuredPeriods.length, 2)
  assert.equal(recordParsed.uninsuredPeriods[0].start, '2019-02')
  assert.equal(recordParsed.ownerChanges.length, 2)
  assert.equal(recordParsed.ownerChanges[0].date, '2025-01-13')
  assert.equal(recordParsed.numberChangeHistory.length, 1)
  assert.equal(recordParsed.numberChangeHistory[0].carNo, '46오XXXX')

  const pairedInterior = extractInteriorColorFromPairs([
    { label: '내장 색상', value: '베이지' },
    { label: '외장 색상', value: '화이트' },
  ], 'Белый')
  assert.equal(pairedInterior, 'Бежевый')

  const textInterior = extractInteriorColorFromText('Seat color black leather interior', 'Белый')
  assert.equal(textInterior, 'Черный')

  const chunkedInterior = extractInteriorColorFromText('완전무사고 / 풀옵션 / 브라운시트 / 7인승 / 블랙박스 아이나비', 'Черный')
  assert.equal(chunkedInterior, 'Коричневый')

  const falsePositiveInterior = extractInteriorColorFromText('블랙박스 아이나비 QXD7000', 'Белый')
  assert.equal(falsePositiveInterior, '')

  console.log('Encar parser checks passed')
}

run()
