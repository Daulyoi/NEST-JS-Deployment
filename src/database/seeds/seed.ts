import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { Customer } from '../../domain/entity/customer.entity';
import { UserCredentials } from '../../domain/entity/user-credentials.entity';
import { Account } from '../../domain/entity/account.entity';
import { Transaction } from '../../domain/entity/transaction.entity';
import { WeeklyReport } from '../../domain/entity/weekly-report.entity';
import { MonthlyReport } from '../../domain/entity/monthly-report.entity';
import { DetectedAnomaly } from '../../domain/entity/detected-anomaly.entity';
import { AccountStatusEnum } from '../../domain/enums/account-status.enum';
import { CredentialStatusEnum } from '../../domain/enums/credential-status.enum';
import { MainCategoryEnum } from '../../domain/enums/main-category.enum';
import { PersonaEnum } from '../../domain/enums/persona.enum';
import { TransactionTypeEnum } from '../../domain/enums/transaction-type.enum';

const D = TransactionTypeEnum.DEBIT;
const C = TransactionTypeEnum.CREDIT;
const W = MainCategoryEnum.WANTS;
const N = MainCategoryEnum.NEEDS;
const S = MainCategoryEnum.SAVINGS;

interface RawTx {
  date: string;
  type: TransactionTypeEnum;
  cat?: MainCategoryEnum;
  sub: string;
  amount: number;
  desc: string;
  notes?: string;
}

function buildTxs(
  customerId: string,
  accountId: string,
  startBalance: number,
  raws: RawTx[],
): { built: Partial<Transaction>[]; finalBalance: number } {
  let balance = startBalance;
  const built = raws.map((r) => {
    const ts = new Date(r.date);
    balance = r.type === C ? balance + r.amount : balance - r.amount;
    return {
      customerId,
      accountId,
      transactionType: r.type,
      mainCategory: r.cat ?? undefined,
      subCategory: r.sub,
      amount: r.amount,
      runningBalance: balance,
      description: r.desc,
      notes: r.notes ?? '',
      transactionTimestamp: ts,
      dayOfWeek: ts.getDay(),
      dayOfMonth: ts.getDate(),
      hour: ts.getHours(),
    } as Partial<Transaction>;
  });
  return { built, finalBalance: balance };
}

// ── Budi Santoso — Tightwad, gaji 6.5jt ─────────────────────────────────────
const BUDI_START = 3_500_000;
const BUDI_TXS: RawTx[] = [
  // April Week 1
  {
    date: '2025-04-01T09:00:00+07:00',
    type: C,
    sub: 'gaji',
    amount: 6_500_000,
    desc: 'Gaji April 2025',
  },
  {
    date: '2025-04-01T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'sewa_kos',
    amount: 1_500_000,
    desc: 'Bayar sewa kos April',
  },
  {
    date: '2025-04-01T20:00:00+07:00',
    type: D,
    cat: N,
    sub: 'bpjs_kesehatan',
    amount: 100_000,
    desc: 'BPJS Kesehatan April',
  },
  {
    date: '2025-04-02T07:30:00+07:00',
    type: D,
    cat: N,
    sub: 'internet',
    amount: 150_000,
    desc: 'IndiHome April',
  },
  {
    date: '2025-04-03T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'listrik',
    amount: 248_000,
    desc: 'Token Listrik PLN',
  },
  {
    date: '2025-04-05T09:30:00+07:00',
    type: D,
    cat: S,
    sub: 'transfer_tabungan',
    amount: 1_500_000,
    desc: 'Transfer ke tabungan deposito',
  },
  {
    date: '2025-04-05T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 287_000,
    desc: 'Belanja Indomaret mingguan',
  },
  // April Week 2
  {
    date: '2025-04-07T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 22_000,
    desc: 'Makan siang warung bu Sri',
  },
  {
    date: '2025-04-08T08:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 25_000,
    desc: 'KRL Commuter Line',
  },
  {
    date: '2025-04-08T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 19_000,
    desc: 'Makan siang nasi padang',
  },
  {
    date: '2025-04-09T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 23_000,
    desc: 'Makan siang warteg',
  },
  {
    date: '2025-04-10T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 20_000,
    desc: 'Makan siang warung nasi',
  },
  {
    date: '2025-04-11T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 18_000,
    desc: 'Makan siang warung bu Sri',
  },
  {
    date: '2025-04-12T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 215_000,
    desc: 'Belanja Alfamart mingguan',
  },
  // April Week 3 — ada anomali kafe
  {
    date: '2025-04-14T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 21_000,
    desc: 'Makan siang warteg',
  },
  {
    date: '2025-04-15T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 22_000,
    desc: 'Makan siang warung nasi',
  },
  {
    date: '2025-04-15T17:30:00+07:00',
    type: D,
    cat: W,
    sub: 'kafe',
    amount: 125_000,
    desc: 'Janji Jiwa bersama teman kantor',
    notes: 'ANOMALY_MARKER',
  },
  {
    date: '2025-04-16T08:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 32_000,
    desc: 'Grab ke kantor',
  },
  {
    date: '2025-04-17T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 19_000,
    desc: 'Makan siang warteg',
  },
  {
    date: '2025-04-18T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 20_000,
    desc: 'Makan siang nasi padang',
  },
  {
    date: '2025-04-19T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 198_000,
    desc: 'Belanja Indomaret mingguan',
  },
  // April Week 4
  {
    date: '2025-04-21T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 22_000,
    desc: 'Makan siang warung bu Sri',
  },
  {
    date: '2025-04-22T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 18_000,
    desc: 'Makan siang warteg',
  },
  {
    date: '2025-04-24T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 23_000,
    desc: 'Makan siang nasi padang',
  },
  {
    date: '2025-04-26T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 231_000,
    desc: 'Belanja Alfamart mingguan',
  },
  // Mei parsial
  {
    date: '2025-05-01T09:00:00+07:00',
    type: C,
    sub: 'gaji',
    amount: 6_500_000,
    desc: 'Gaji Mei 2025',
  },
  {
    date: '2025-05-02T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'sewa_kos',
    amount: 1_500_000,
    desc: 'Bayar sewa kos Mei',
  },
  {
    date: '2025-05-02T20:00:00+07:00',
    type: D,
    cat: N,
    sub: 'bpjs_kesehatan',
    amount: 100_000,
    desc: 'BPJS Kesehatan Mei',
  },
  {
    date: '2025-05-03T07:30:00+07:00',
    type: D,
    cat: N,
    sub: 'internet',
    amount: 150_000,
    desc: 'IndiHome Mei',
  },
  {
    date: '2025-05-03T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'listrik',
    amount: 261_000,
    desc: 'Token Listrik PLN',
  },
  {
    date: '2025-05-05T09:30:00+07:00',
    type: D,
    cat: S,
    sub: 'transfer_tabungan',
    amount: 1_500_000,
    desc: 'Transfer ke tabungan deposito',
  },
  {
    date: '2025-05-05T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 275_000,
    desc: 'Belanja Indomaret mingguan',
  },
  {
    date: '2025-05-07T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 21_000,
    desc: 'Makan siang warteg',
  },
  {
    date: '2025-05-08T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 19_000,
    desc: 'Makan siang nasi padang',
  },
  {
    date: '2025-05-10T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 210_000,
    desc: 'Belanja Alfamart',
  },
  {
    date: '2025-05-12T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 22_000,
    desc: 'Makan siang warung bu Sri',
  },
  {
    date: '2025-05-14T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 20_000,
    desc: 'Makan siang warteg',
  },
  {
    date: '2025-05-16T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 21_000,
    desc: 'Makan siang nasi padang',
  },
  {
    date: '2025-05-17T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 226_000,
    desc: 'Belanja Indomaret',
  },
  {
    date: '2025-05-19T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 22_000,
    desc: 'Makan siang warteg',
  },
];

// ── Sari Dewi — Unconflicted, gaji 12jt ─────────────────────────────────────
const SARI_START = 8_500_000;
const SARI_TXS: RawTx[] = [
  // April Week 1
  {
    date: '2025-04-01T09:00:00+07:00',
    type: C,
    sub: 'gaji',
    amount: 12_000_000,
    desc: 'Gaji April 2025',
  },
  {
    date: '2025-04-01T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'sewa_kos',
    amount: 2_500_000,
    desc: 'Sewa apartemen April',
  },
  {
    date: '2025-04-01T20:00:00+07:00',
    type: D,
    cat: N,
    sub: 'bpjs_kesehatan',
    amount: 150_000,
    desc: 'BPJS Kesehatan April',
  },
  {
    date: '2025-04-02T08:00:00+07:00',
    type: D,
    cat: N,
    sub: 'internet',
    amount: 250_000,
    desc: 'Biznet April',
  },
  {
    date: '2025-04-03T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'listrik',
    amount: 312_000,
    desc: 'PLN token listrik',
  },
  {
    date: '2025-04-05T09:00:00+07:00',
    type: D,
    cat: S,
    sub: 'transfer_tabungan',
    amount: 2_000_000,
    desc: 'Transfer tabungan rutin',
  },
  {
    date: '2025-04-05T11:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 487_000,
    desc: 'Belanja Ranch Market',
  },
  {
    date: '2025-04-06T10:30:00+07:00',
    type: D,
    cat: W,
    sub: 'kafe',
    amount: 78_000,
    desc: 'Starbucks Sudirman',
  },
  // April Week 2
  {
    date: '2025-04-07T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 45_000,
    desc: 'Makan siang Warung Sederhana',
  },
  {
    date: '2025-04-08T09:00:00+07:00',
    type: D,
    cat: W,
    sub: 'langganan_streaming',
    amount: 54_000,
    desc: 'Netflix subscription',
  },
  {
    date: '2025-04-08T20:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 135_000,
    desc: 'Makan malam Sate Khas Senayan',
  },
  {
    date: '2025-04-09T08:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 45_000,
    desc: 'Grab ke kantor',
  },
  {
    date: '2025-04-10T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 52_000,
    desc: 'Makan siang Gado-gado Boplo',
  },
  {
    date: '2025-04-12T14:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 412_000,
    desc: 'Belanja Superindo mingguan',
  },
  {
    date: '2025-04-13T11:00:00+07:00',
    type: D,
    cat: W,
    sub: 'kafe',
    amount: 65_000,
    desc: 'J.CO Donuts & Coffee',
  },
  // April Week 3 — ada anomali belanja_online
  {
    date: '2025-04-14T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 48_000,
    desc: 'Makan siang kantin perkantoran',
  },
  {
    date: '2025-04-15T09:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 55_000,
    desc: 'Grab pergi pulang',
  },
  {
    date: '2025-04-16T19:00:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 85_000,
    desc: 'Bioskop CGV XXI',
  },
  {
    date: '2025-04-17T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 42_000,
    desc: 'Makan siang warteg',
  },
  {
    date: '2025-04-19T13:00:00+07:00',
    type: D,
    cat: W,
    sub: 'belanja_online',
    amount: 1_850_000,
    desc: 'Shopee Harbolnas skincare & homeware',
    notes: 'ANOMALY_MARKER',
  },
  {
    date: '2025-04-19T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 398_000,
    desc: 'Belanja Superindo',
  },
  // April Week 4
  {
    date: '2025-04-21T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 55_000,
    desc: 'Makan siang Nasi Goreng Kambing Kebon Sirih',
  },
  {
    date: '2025-04-22T19:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 145_000,
    desc: 'Makan malam Poke House SCBD',
  },
  {
    date: '2025-04-24T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 50_000,
    desc: 'Makan siang kantin',
  },
  {
    date: '2025-04-25T20:00:00+07:00',
    type: D,
    cat: W,
    sub: 'langganan_streaming',
    amount: 29_000,
    desc: 'Spotify Premium',
  },
  {
    date: '2025-04-26T14:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 445_000,
    desc: 'Belanja Ranch Market mingguan',
  },
  {
    date: '2025-04-27T10:30:00+07:00',
    type: D,
    cat: W,
    sub: 'kafe',
    amount: 72_000,
    desc: 'Fore Coffee Sudirman',
  },
  // Mei parsial
  {
    date: '2025-05-01T09:00:00+07:00',
    type: C,
    sub: 'gaji',
    amount: 12_000_000,
    desc: 'Gaji Mei 2025',
  },
  {
    date: '2025-05-02T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'sewa_kos',
    amount: 2_500_000,
    desc: 'Sewa apartemen Mei',
  },
  {
    date: '2025-05-02T20:00:00+07:00',
    type: D,
    cat: N,
    sub: 'bpjs_kesehatan',
    amount: 150_000,
    desc: 'BPJS Kesehatan Mei',
  },
  {
    date: '2025-05-05T09:00:00+07:00',
    type: D,
    cat: S,
    sub: 'transfer_tabungan',
    amount: 2_000_000,
    desc: 'Transfer tabungan rutin',
  },
  {
    date: '2025-05-05T11:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 520_000,
    desc: 'Belanja Superindo mingguan',
  },
  {
    date: '2025-05-06T08:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 48_000,
    desc: 'Grab ke kantor',
  },
  {
    date: '2025-05-08T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 47_000,
    desc: 'Makan siang warung',
  },
  {
    date: '2025-05-10T19:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 165_000,
    desc: 'Makan malam Mie Aceh Seulawah',
  },
  {
    date: '2025-05-12T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 53_000,
    desc: 'Makan siang gado-gado',
  },
  {
    date: '2025-05-13T09:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 62_000,
    desc: 'Grab pergi pulang',
  },
  {
    date: '2025-05-14T19:30:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 95_000,
    desc: 'Bioskop XXI Sinema Premium',
  },
  {
    date: '2025-05-15T12:00:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 45_000,
    desc: 'Makan siang kantin perkantoran',
  },
  {
    date: '2025-05-17T14:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 480_000,
    desc: 'Belanja Ranch Market',
  },
  {
    date: '2025-05-20T13:00:00+07:00',
    type: D,
    cat: W,
    sub: 'belanja_online',
    amount: 380_000,
    desc: 'Tokopedia kebutuhan rumah',
  },
  {
    date: '2025-05-22T12:30:00+07:00',
    type: D,
    cat: N,
    sub: 'makan',
    amount: 51_000,
    desc: 'Makan siang Warung Padang',
  },
];

// ── Rian Pratama — Spendthrift, gaji 22jt ───────────────────────────────────
const RIAN_START = 1_500_000;
const RIAN_TXS: RawTx[] = [
  // April Week 1
  {
    date: '2025-04-01T09:00:00+07:00',
    type: C,
    sub: 'gaji',
    amount: 22_000_000,
    desc: 'Gaji April 2025',
  },
  {
    date: '2025-04-01T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'sewa_kos',
    amount: 3_500_000,
    desc: 'Sewa studio apartemen April',
  },
  {
    date: '2025-04-01T20:00:00+07:00',
    type: D,
    cat: N,
    sub: 'bpjs_kesehatan',
    amount: 200_000,
    desc: 'BPJS Kesehatan April',
  },
  {
    date: '2025-04-02T12:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 185_000,
    desc: 'Makan siang Social House SCBD',
  },
  {
    date: '2025-04-03T10:00:00+07:00',
    type: D,
    cat: W,
    sub: 'belanja_online',
    amount: 850_000,
    desc: 'Tokopedia sepatu sneaker',
  },
  {
    date: '2025-04-04T20:30:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 750_000,
    desc: "Tiket konser Maliq & D'Essentials",
  },
  {
    date: '2025-04-05T09:00:00+07:00',
    type: D,
    cat: N,
    sub: 'listrik',
    amount: 425_000,
    desc: 'PLN token listrik',
  },
  {
    date: '2025-04-05T11:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 567_000,
    desc: 'Belanja Ranch Market',
  },
  {
    date: '2025-04-06T19:30:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 420_000,
    desc: 'Fine dining bersama pacar di Locavore Jakarta',
  },
  // April Week 2 — ada anomali hiburan
  {
    date: '2025-04-07T10:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 75_000,
    desc: 'Grab pergi pulang',
  },
  {
    date: '2025-04-08T12:30:00+07:00',
    type: D,
    cat: W,
    sub: 'pakaian',
    amount: 625_000,
    desc: 'Shopee baju casual streetwear',
  },
  {
    date: '2025-04-09T22:00:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 150_000,
    desc: 'Top-up Mobile Legends diamond',
  },
  {
    date: '2025-04-10T12:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 210_000,
    desc: 'Makan siang Burger King fx Sudirman',
  },
  {
    date: '2025-04-11T20:00:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 3_500_000,
    desc: 'VIP table OTA Club Jakarta',
    notes: 'ANOMALY_MARKER',
  },
  {
    date: '2025-04-12T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 612_000,
    desc: 'Belanja Hypermart mingguan',
  },
  // April Week 3
  {
    date: '2025-04-14T12:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 195_000,
    desc: 'Makan siang Greens and Beans',
  },
  {
    date: '2025-04-15T09:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 95_000,
    desc: 'Grab seminggu',
  },
  {
    date: '2025-04-16T18:00:00+07:00',
    type: D,
    cat: W,
    sub: 'gadget',
    amount: 1_250_000,
    desc: 'Lazada earbuds TWS wireless',
  },
  {
    date: '2025-04-17T20:30:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 285_000,
    desc: 'Makan malam Sushi Tei Grand Indonesia',
  },
  {
    date: '2025-04-18T22:00:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 200_000,
    desc: 'Top-up PUBG Mobile UC',
  },
  {
    date: '2025-04-19T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 589_000,
    desc: 'Belanja Hypermart',
  },
  {
    date: '2025-04-20T11:00:00+07:00',
    type: D,
    cat: N,
    sub: 'internet',
    amount: 350_000,
    desc: 'IndiHome April',
  },
  // April Week 4
  {
    date: '2025-04-21T09:00:00+07:00',
    type: D,
    cat: S,
    sub: 'transfer_tabungan',
    amount: 500_000,
    desc: 'Transfer tabungan',
  },
  {
    date: '2025-04-21T12:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 175_000,
    desc: 'Makan siang Kitsune',
  },
  {
    date: '2025-04-23T20:00:00+07:00',
    type: D,
    cat: W,
    sub: 'belanja_online',
    amount: 980_000,
    desc: 'Shopee jam tangan casual',
  },
  {
    date: '2025-04-24T12:30:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 220_000,
    desc: 'Makan siang Signature Steak',
  },
  {
    date: '2025-04-25T19:00:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 180_000,
    desc: 'Bioskop XXI Gold Class',
  },
  {
    date: '2025-04-26T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 634_000,
    desc: 'Belanja Ranch Market mingguan',
  },
  // Mei parsial
  {
    date: '2025-05-01T09:00:00+07:00',
    type: C,
    sub: 'gaji',
    amount: 22_000_000,
    desc: 'Gaji Mei 2025',
  },
  {
    date: '2025-05-02T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'sewa_kos',
    amount: 3_500_000,
    desc: 'Sewa studio apartemen Mei',
  },
  {
    date: '2025-05-03T12:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 240_000,
    desc: 'Makan siang Sushiro Jakarta Selatan',
  },
  {
    date: '2025-05-04T10:00:00+07:00',
    type: D,
    cat: W,
    sub: 'belanja_online',
    amount: 1_450_000,
    desc: 'Tokopedia monitor gaming 24"',
  },
  {
    date: '2025-05-05T09:00:00+07:00',
    type: D,
    cat: N,
    sub: 'listrik',
    amount: 438_000,
    desc: 'PLN token listrik',
  },
  {
    date: '2025-05-05T11:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 598_000,
    desc: 'Belanja Ranch Market mingguan',
  },
  {
    date: '2025-05-07T20:30:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 485_000,
    desc: 'Dinner ulang tahun teman di Koi Kemang',
  },
  {
    date: '2025-05-09T22:00:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 250_000,
    desc: 'Top-up Genshin Impact Genesis Crystal',
  },
  {
    date: '2025-05-10T09:00:00+07:00',
    type: D,
    cat: N,
    sub: 'transport',
    amount: 110_000,
    desc: 'Grab seminggu',
  },
  {
    date: '2025-05-12T18:00:00+07:00',
    type: D,
    cat: W,
    sub: 'belanja_online',
    amount: 1_200_000,
    desc: 'Shopee keyboard mechanical gaming',
  },
  {
    date: '2025-05-14T12:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 195_000,
    desc: 'Makan siang Mie Gacoan',
  },
  {
    date: '2025-05-15T20:00:00+07:00',
    type: D,
    cat: W,
    sub: 'langganan_streaming',
    amount: 125_000,
    desc: 'Netflix + Disney+ Hotstar bundle',
  },
  {
    date: '2025-05-17T15:00:00+07:00',
    type: D,
    cat: N,
    sub: 'belanja_dapur',
    amount: 612_000,
    desc: 'Belanja Hypermart mingguan',
  },
  {
    date: '2025-05-18T19:00:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 350_000,
    desc: 'Dinner bersama teman di Gia Jakarta',
  },
  {
    date: '2025-05-20T22:00:00+07:00',
    type: D,
    cat: W,
    sub: 'hiburan',
    amount: 320_000,
    desc: 'Steam: Elden Ring Shadow of the Erdtree DLC',
  },
  {
    date: '2025-05-22T12:30:00+07:00',
    type: D,
    cat: W,
    sub: 'makan_restoran',
    amount: 210_000,
    desc: 'Makan siang restoran Thailand',
  },
  {
    date: '2025-05-24T10:00:00+07:00',
    type: D,
    cat: W,
    sub: 'belanja_online',
    amount: 875_000,
    desc: 'Tokopedia mousepad XL gaming',
  },
];

// ── Main Seeder ──────────────────────────────────────────────────────────────
async function main() {
  console.log('Connecting to database...');
  const ds = await AppDataSource.initialize();

  try {
    console.log('Clearing existing data...');
    // user_credentials has ON DELETE NO ACTION, clear it first
    await ds.query('TRUNCATE TABLE user_credentials CASCADE');
    await ds.query('TRUNCATE TABLE customer CASCADE');
    console.log('Tables cleared.');

    const customerRepo = ds.getRepository(Customer);
    const credRepo = ds.getRepository(UserCredentials);
    const accountRepo = ds.getRepository(Account);
    const txRepo = ds.getRepository(Transaction);
    const weeklyRepo = ds.getRepository(WeeklyReport);
    const monthlyRepo = ds.getRepository(MonthlyReport);
    const anomalyRepo = ds.getRepository(DetectedAnomaly);

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // ── 1. Customers ──────────────────────────────────────────────────────────
    console.log('Seeding customers...');
    const [budi, sari, rian] = await customerRepo.save([
      {
        fullName: 'Budi Santoso',
        dateOfBirth: new Date('1995-03-15'),
        mothersMaidenName: 'Sumiati',
        demographicSegment: 'young_professional',
        monthlyIncome: 6_500_000,
        savingsGoal: 2_000_000,
        basePersona: PersonaEnum.TIGHTWAD,
        isDynamic: false,
        currentWantsRatio: 0.0372,
        currentNeedsRatio: 0.9628,
      },
      {
        fullName: 'Sari Dewi',
        dateOfBirth: new Date('1991-07-22'),
        mothersMaidenName: 'Hartini',
        demographicSegment: 'established_professional',
        monthlyIncome: 12_000_000,
        savingsGoal: 3_000_000,
        basePersona: PersonaEnum.UNCONFLICTED,
        isDynamic: false,
        currentWantsRatio: 0.3198,
        currentNeedsRatio: 0.6802,
      },
      {
        fullName: 'Rian Pratama',
        dateOfBirth: new Date('1999-11-08'),
        mothersMaidenName: 'Nuraini',
        demographicSegment: 'young_professional',
        monthlyIncome: 22_000_000,
        savingsGoal: 500_000,
        basePersona: PersonaEnum.SPENDTHRIFT,
        isDynamic: false,
        currentWantsRatio: 0.5909,
        currentNeedsRatio: 0.4091,
      },
    ]);

    // ── 2. UserCredentials ────────────────────────────────────────────────────
    console.log('Seeding user credentials...');
    await credRepo.save([
      {
        customerId: budi.id,
        username: 'budi.santoso',
        email: 'budi.santoso@gmail.com',
        password: hashedPassword,
        mpin: '123456',
        status: CredentialStatusEnum.ACTIVE,
      },
      {
        customerId: sari.id,
        username: 'sari.dewi',
        email: 'sari.dewi@gmail.com',
        password: hashedPassword,
        mpin: '123456',
        status: CredentialStatusEnum.ACTIVE,
      },
      {
        customerId: rian.id,
        username: 'rian.pratama',
        email: 'rian.pratama@gmail.com',
        password: hashedPassword,
        mpin: '123456',
        status: CredentialStatusEnum.ACTIVE,
      },
    ]);

    // ── 3. Accounts ───────────────────────────────────────────────────────────
    console.log('Seeding accounts...');
    // Save placeholder accounts (balance updated after computing txs)
    const [budiAcc, sariAcc, rianAcc] = await accountRepo.save([
      {
        customerId: budi.id,
        accountNumber: '1230001234567',
        balance: 0,
        status: AccountStatusEnum.ACTIVE,
      },
      {
        customerId: sari.id,
        accountNumber: '4560001234567',
        balance: 0,
        status: AccountStatusEnum.ACTIVE,
      },
      {
        customerId: rian.id,
        accountNumber: '7890001234567',
        balance: 0,
        status: AccountStatusEnum.ACTIVE,
      },
    ]);

    // ── 4. Transactions ───────────────────────────────────────────────────────
    console.log('Seeding transactions...');
    const { built: budiBuilt, finalBalance: budiFinal } = buildTxs(
      budi.id,
      budiAcc.id,
      BUDI_START,
      BUDI_TXS,
    );
    const { built: sariBuilt, finalBalance: sariFinal } = buildTxs(
      sari.id,
      sariAcc.id,
      SARI_START,
      SARI_TXS,
    );
    const { built: rianBuilt, finalBalance: rianFinal } = buildTxs(
      rian.id,
      rianAcc.id,
      RIAN_START,
      RIAN_TXS,
    );

    const budiTxs = await txRepo.save(budiBuilt as Transaction[]);
    const sariTxs = await txRepo.save(sariBuilt as Transaction[]);
    const rianTxs = await txRepo.save(rianBuilt as Transaction[]);

    // Update account balances to match final running balance
    await accountRepo.update(budiAcc.id, { balance: budiFinal });
    await accountRepo.update(sariAcc.id, { balance: sariFinal });
    await accountRepo.update(rianAcc.id, { balance: rianFinal });

    console.log(
      `Budi: ${budiTxs.length} tx, balance Rp${budiFinal.toLocaleString()}`,
    );
    console.log(
      `Sari: ${sariTxs.length} tx, balance Rp${sariFinal.toLocaleString()}`,
    );
    console.log(
      `Rian: ${rianTxs.length} tx, balance Rp${rianFinal.toLocaleString()}`,
    );

    // ── 5. Weekly Reports (April 4 minggu) ───────────────────────────────────
    console.log('Seeding weekly reports...');
    const weeks = [
      { reportDate: '2025-04-06', periodStart: '2025-04-01' },
      { reportDate: '2025-04-13', periodStart: '2025-04-07' },
      { reportDate: '2025-04-20', periodStart: '2025-04-14' },
      { reportDate: '2025-04-27', periodStart: '2025-04-21' },
    ];

    // Budi weekly stats (pre-computed)
    const budiWeekly = [
      {
        wantsRatio: 0.0,
        needsRatio: 1.0,
        totalExpenses: 2_285_000,
        anomalyCount: 0,
        reportText:
          'Minggu pertama April 2025: Total pengeluaran Rp2.285.000, seluruhnya kebutuhan pokok. Pengeluaran terbesar sewa kos (Rp1.500.000) dan listrik (Rp248.000). Tabungan minggu ini Rp1.500.000. Pola pengeluaran sangat terkontrol sesuai profil Tightwad.',
      },
      {
        wantsRatio: 0.0,
        needsRatio: 1.0,
        totalExpenses: 342_000,
        anomalyCount: 0,
        reportText:
          'Minggu kedua April 2025: Total pengeluaran Rp342.000, jauh lebih rendah karena tidak ada tagihan bulanan. Pengeluaran hanya untuk makan siang harian dan transport. Konsistensi kebutuhan 100% — nol pengeluaran keinginan.',
      },
      {
        wantsRatio: 0.286,
        needsRatio: 0.714,
        totalExpenses: 437_000,
        anomalyCount: 1,
        reportText:
          'Minggu ketiga April 2025: Total pengeluaran Rp437.000. Terdapat 1 anomali — pengeluaran kafe Rp125.000 di Janji Jiwa, 8x lebih tinggi dari rata-rata kafe Anda (biasanya Rp0). Pengeluaran keinginan minggu ini mencapai 28,6% dari total.',
      },
      {
        wantsRatio: 0.0,
        needsRatio: 1.0,
        totalExpenses: 294_000,
        anomalyCount: 0,
        reportText:
          'Minggu keempat April 2025: Total pengeluaran Rp294.000, kembali ke pola normal. Seluruh pengeluaran kebutuhan pokok — makan siang dan belanja dapur. Profil Tightwad kembali konsisten.',
      },
    ];

    // Sari weekly stats (pre-computed)
    const sariWeekly = [
      {
        wantsRatio: 0.0207,
        needsRatio: 0.9793,
        totalExpenses: 3_777_000,
        anomalyCount: 0,
        reportText:
          'Minggu pertama April 2025: Total pengeluaran Rp3.777.000. Pengeluaran didominasi kebutuhan pokok (97,9%) termasuk sewa apartemen dan tagihan rutin. Pengeluaran keinginan Rp78.000 untuk kafe — wajar. Tabungan rutin Rp2.000.000 berhasil dilakukan.',
      },
      {
        wantsRatio: 0.3144,
        needsRatio: 0.6856,
        totalExpenses: 808_000,
        anomalyCount: 0,
        reportText:
          'Minggu kedua April 2025: Total pengeluaran Rp808.000 dengan rasio keinginan 31,4%. Pengeluaran seimbang antara kebutuhan dan keinginan — sesuai profil Unconflicted. Termasuk langganan Netflix, makan malam restoran, dan dua kunjungan kafe.',
      },
      {
        wantsRatio: 0.7809,
        needsRatio: 0.2191,
        totalExpenses: 2_478_000,
        anomalyCount: 1,
        reportText:
          'Minggu ketiga April 2025: Total pengeluaran Rp2.478.000. Terdapat 1 anomali — pembelian Shopee Rp1.850.000 untuk skincare & homeware, 4,6x lebih tinggi dari rata-rata belanja online bulanan Anda (Rp400.000). Rasio keinginan melonjak ke 78,1%.',
      },
      {
        wantsRatio: 0.309,
        needsRatio: 0.691,
        totalExpenses: 796_000,
        anomalyCount: 0,
        reportText:
          'Minggu keempat April 2025: Total pengeluaran Rp796.000, kembali ke pola normal. Rasio keinginan 30,9% mencerminkan keseimbangan khas profil Unconflicted. Termasuk makan malam restoran, Spotify, dan kunjungan kafe.',
      },
    ];

    // Rian weekly stats (pre-computed)
    const rianWeekly = [
      {
        wantsRatio: 0.3197,
        needsRatio: 0.6803,
        totalExpenses: 6_897_000,
        anomalyCount: 0,
        reportText:
          'Minggu pertama April 2025: Total pengeluaran Rp6.897.000. Meskipun pengeluaran besar, kebutuhan masih mendominasi (68%) karena sewa apartemen Rp3.500.000. Pengeluaran keinginan Rp2.205.000 termasuk konser, belanja online, dan fine dining.',
      },
      {
        wantsRatio: 0.8671,
        needsRatio: 0.1329,
        totalExpenses: 5_172_000,
        anomalyCount: 1,
        reportText:
          'Minggu kedua April 2025: Total pengeluaran Rp5.172.000 dengan rasio keinginan 86,7%. Terdapat 1 anomali — pengeluaran hiburan Rp3.500.000 di OTA Club (VIP table), 2,9x lebih tinggi dari rata-rata pengeluaran hiburan Anda. Pola pengeluaran sangat tinggi.',
      },
      {
        wantsRatio: 0.6511,
        needsRatio: 0.3489,
        totalExpenses: 2_964_000,
        anomalyCount: 0,
        reportText:
          'Minggu ketiga April 2025: Total pengeluaran Rp2.964.000 dengan rasio keinginan 65,1%. Pengeluaran termasuk earbuds Lazada (Rp1.250.000), makan malam Sushi Tei, dan top-up game. Pola konsisten dengan profil Spendthrift.',
      },
      {
        wantsRatio: 0.7104,
        needsRatio: 0.2896,
        totalExpenses: 2_189_000,
        anomalyCount: 0,
        reportText:
          'Minggu keempat April 2025: Total pengeluaran Rp2.189.000 dengan rasio keinginan 71%. Pengeluaran meliputi jam tangan online, makan restoran premium, dan bioskop Gold Class. Tabungan Rp500.000 berhasil dilakukan meski kecil.',
      },
    ];

    const savedBudiWeekly: WeeklyReport[] = [];
    const savedSariWeekly: WeeklyReport[] = [];
    const savedRianWeekly: WeeklyReport[] = [];

    for (let i = 0; i < 4; i++) {
      const [bw, sw, rw] = await weeklyRepo.save([
        {
          customerId: budi.id,
          reportDate: new Date(weeks[i].reportDate),
          periodStart: new Date(weeks[i].periodStart),
          persona: PersonaEnum.TIGHTWAD,
          ...budiWeekly[i],
        },
        {
          customerId: sari.id,
          reportDate: new Date(weeks[i].reportDate),
          periodStart: new Date(weeks[i].periodStart),
          persona: PersonaEnum.UNCONFLICTED,
          ...sariWeekly[i],
        },
        {
          customerId: rian.id,
          reportDate: new Date(weeks[i].reportDate),
          periodStart: new Date(weeks[i].periodStart),
          persona: PersonaEnum.SPENDTHRIFT,
          ...rianWeekly[i],
        },
      ]);
      savedBudiWeekly.push(bw);
      savedSariWeekly.push(sw);
      savedRianWeekly.push(rw);
    }

    // ── 6. Monthly Reports (April) ────────────────────────────────────────────
    console.log('Seeding monthly reports...');
    await monthlyRepo.save([
      {
        customerId: budi.id,
        targetMonth: '2025-04',
        persona: PersonaEnum.TIGHTWAD,
        prevPersona: undefined,
        savingsRate: 0.2308,
        wantsRatio: 0.0372,
        needsRatio: 0.9628,
        wantsAmount: 125_000,
        needsAmount: 3_233_000,
        savingsAmount: 1_500_000,
        behavioralFeatures: {
          avg_daily_spending: 111_267,
          top_needs_category: 'sewa_kos',
          top_wants_category: 'kafe',
          weekend_spending_ratio: 0.22,
          evening_txn_ratio: 0.08,
          recurring_categories: [
            'sewa_kos',
            'bpjs_kesehatan',
            'internet',
            'listrik',
          ],
          impulse_purchase_count: 1,
          savings_consistency: 1.0,
          transaction_count: 25,
        },
        reportText:
          'Laporan bulanan April 2025 — Budi Santoso: Total pengeluaran Rp3.358.000 dari gaji Rp6.500.000. Kebutuhan mendominasi 96,3% (Rp3.233.000), keinginan hanya 3,7% (Rp125.000). Tingkat tabungan 23,1% (Rp1.500.000) melampaui target Rp2.000.000 secara proporsional. Satu anomali terdeteksi pada pengeluaran kafe pertengahan bulan. Profil Tightwad terjaga dengan sangat baik. Rekomendasi: pertahankan pola ini dan pertimbangkan investasi reksa dana untuk dana idle.',
      },
      {
        customerId: sari.id,
        targetMonth: '2025-04',
        persona: PersonaEnum.UNCONFLICTED,
        prevPersona: undefined,
        savingsRate: 0.1667,
        wantsRatio: 0.3198,
        needsRatio: 0.6802,
        wantsAmount: 2_513_000,
        needsAmount: 5_346_000,
        savingsAmount: 2_000_000,
        behavioralFeatures: {
          avg_daily_spending: 261_967,
          top_needs_category: 'sewa_kos',
          top_wants_category: 'belanja_online',
          weekend_spending_ratio: 0.28,
          evening_txn_ratio: 0.22,
          recurring_categories: [
            'sewa_kos',
            'bpjs_kesehatan',
            'internet',
            'listrik',
            'langganan_streaming',
          ],
          impulse_purchase_count: 1,
          savings_consistency: 1.0,
          transaction_count: 27,
        },
        reportText:
          'Laporan bulanan April 2025 — Sari Dewi: Total pengeluaran Rp7.859.000 dari gaji Rp12.000.000. Rasio kebutuhan 68% (Rp5.346.000) dan keinginan 32% (Rp2.513.000) mencerminkan pola Unconflicted yang sehat. Tabungan Rp2.000.000 (16,7% dari gaji) sudah baik namun masih di bawah target Rp3.000.000. Satu anomali pembelian online besar terdeteksi minggu ketiga. Rekomendasi: tingkatkan alokasi tabungan di awal bulan dan batasi belanja impuls online.',
      },
      {
        customerId: rian.id,
        targetMonth: '2025-04',
        persona: PersonaEnum.SPENDTHRIFT,
        prevPersona: undefined,
        savingsRate: 0.0227,
        wantsRatio: 0.5909,
        needsRatio: 0.4091,
        wantsAmount: 10_175_000,
        needsAmount: 7_047_000,
        savingsAmount: 500_000,
        behavioralFeatures: {
          avg_daily_spending: 574_067,
          top_needs_category: 'sewa_kos',
          top_wants_category: 'hiburan',
          weekend_spending_ratio: 0.45,
          evening_txn_ratio: 0.41,
          late_night_txn_ratio: 0.18,
          recurring_categories: ['sewa_kos', 'bpjs_kesehatan', 'listrik'],
          impulse_purchase_count: 3,
          savings_consistency: 0.5,
          transaction_count: 28,
        },
        reportText:
          'Laporan bulanan April 2025 — Rian Pratama: Total pengeluaran Rp17.222.000 dari gaji Rp22.000.000. Keinginan mendominasi 59,1% (Rp10.175.000) dengan pengeluaran hiburan dan belanja online yang sangat tinggi. Tingkat tabungan hanya 2,3% (Rp500.000), jauh di bawah target Rp500.000. Satu anomali besar terdeteksi — pengeluaran club Rp3.500.000. Rekomendasi: atur auto-debit tabungan di awal bulan, batasi pengeluaran hiburan maksimal Rp2.000.000/bulan.',
      },
    ]);

    // ── 7. Detected Anomalies ─────────────────────────────────────────────────
    console.log('Seeding detected anomalies...');

    // Cari transaksi anomali berdasarkan marker di notes
    const budiAnomalyTx = budiTxs.find((t) => t.notes === 'ANOMALY_MARKER')!;
    const sariAnomalyTx = sariTxs.find((t) => t.notes === 'ANOMALY_MARKER')!;
    const rianAnomalyTx = rianTxs.find((t) => t.notes === 'ANOMALY_MARKER')!;

    // Bersihkan marker setelah digunakan
    await txRepo.update(budiAnomalyTx.id, { notes: '' });
    await txRepo.update(sariAnomalyTx.id, { notes: '' });
    await txRepo.update(rianAnomalyTx.id, { notes: '' });

    // Budi: kafe anomali di Week 3 (reportDate Apr 20 = index 2)
    // Sari: belanja_online anomali di Week 3 (reportDate Apr 20 = index 2)
    // Rian: hiburan anomali di Week 2 (reportDate Apr 13 = index 1)
    await anomalyRepo.save([
      {
        transactionId: budiAnomalyTx.id,
        customerId: budi.id,
        weeklyReportId: savedBudiWeekly[2].id,
        subCategory: 'kafe',
        amount: 125_000,
        mae: 98.5,
        thresholdVal: 75.0,
        ratio: 8.33,
        anomalyContext:
          'Pengeluaran kategori kafe sebesar Rp125.000 terdeteksi sebagai anomali. Rata-rata pengeluaran kafe Anda dalam 3 bulan terakhir adalah Rp0 — Anda hampir tidak pernah mengunjungi kafe. Transaksi ini merupakan penyimpangan signifikan dari pola Tightwad yang biasanya sangat hemat. MAE score 98.5 jauh melampaui threshold 75.0.',
      },
      {
        transactionId: sariAnomalyTx.id,
        customerId: sari.id,
        weeklyReportId: savedSariWeekly[2].id,
        subCategory: 'belanja_online',
        amount: 1_850_000,
        mae: 312.4,
        thresholdVal: 180.0,
        ratio: 4.63,
        anomalyContext:
          'Pengeluaran kategori belanja_online sebesar Rp1.850.000 terdeteksi sebagai anomali. Rata-rata pengeluaran belanja online Anda adalah Rp400.000/bulan. Transaksi Shopee Harbolnas ini 4,6x lebih besar dari rata-rata. MAE score 312.4 melampaui threshold 180.0. Kemungkinan pembelian impuls pada momen promo.',
      },
      {
        transactionId: rianAnomalyTx.id,
        customerId: rian.id,
        weeklyReportId: savedRianWeekly[1].id,
        subCategory: 'hiburan',
        amount: 3_500_000,
        mae: 845.6,
        thresholdVal: 500.0,
        ratio: 2.92,
        anomalyContext:
          'Pengeluaran kategori hiburan sebesar Rp3.500.000 terdeteksi sebagai anomali. Rata-rata pengeluaran hiburan Anda adalah Rp1.200.000/bulan. Pengeluaran VIP table di OTA Club ini 2,9x lebih besar dari rata-rata. MAE score 845.6 jauh melampaui threshold 500.0. Pengeluaran ini terjadi di hari kerja (Jumat malam) pukul 20:00.',
      },
    ]);

    console.log('\n✅ Seeding selesai!');
    console.log('─────────────────────────────────────────');
    console.log('Akun tersedia untuk login:');
    console.log('  budi.santoso@gmail.com  │ Password123! │ Tightwad');
    console.log('  sari.dewi@gmail.com     │ Password123! │ Unconflicted');
    console.log('  rian.pratama@gmail.com  │ Password123! │ Spendthrift');
    console.log('─────────────────────────────────────────');
  } catch (err) {
    console.error('❌ Seeding gagal:', err);
    process.exit(1);
  } finally {
    await ds.destroy();
  }
}

main();
