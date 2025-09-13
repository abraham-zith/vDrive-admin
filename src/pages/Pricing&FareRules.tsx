import React, { useState, useMemo } from "react";
import { getHours, getMinutes } from "date-fns";
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Radio,
  Table,
  Space,
  Card,
  Collapse,
  Drawer,
  Typography,
  Descriptions,
  Divider,
} from "antd";
import {
  DownloadOutlined,
  SettingOutlined,
  FilterOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { FiUsers } from "react-icons/fi";
import { utils, writeFile } from "xlsx"; // ← add this

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { Title, Text } = Typography;

interface FilterValues {
  country?: string;
  state?: string;
  district?: string;
  area?: string;
  pincode?: string;
  isHotspot?: boolean;
  hotspotId?: string;
  hotspotName?: string;
  baseFareRangeMin?: number;
  baseFareRangeMax?: number;
  driverType?: string; // "normal" | "premium" | "elite"
  cancellationFeeRangeMin?: number;
  cancellationFeeRangeMax?: number;
  waitingFeePerMinMin?: number;
  waitingFeePerMinMax?: number;
  waitingFeeAmountMin?: number;
  waitingFeeAmountMax?: number;
  dayOfWeek?: string;
  timeFrom?: Date | null;
  timeTo?: Date | null;
  rateRangeMin?: number;
  rateRangeMax?: number;
}

interface PriceSetting {
  key: string;
  country: string;
  state: string;
  district: string;
  area: string;
  pincode: string;
  hotspotName: string;
  hotspotId: string;
  isHotspot: boolean;
  baseFare: string;
  driverType: string;
  cancellationFee: string;
  waitingFee: string;
  day: string;
  timeRange: string;
  rateRange: string;
}

type ApiTiming = {
  day: string;
  from: { time: number; type: "AM" | "PM" };
  to: { time: number; type: "AM" | "PM" };
  rate: number;
};
type ApiRateDetails = {
  driverType: "normal" | "premium" | "elite" | string;
  cancellationFee: number;
  waitingFee: { perMinutes: number; fee: number };
  timing: ApiTiming[];
};
type ApiItem = {
  location: {
    country: string;
    state: string;
    district: string;
    area: string;
    pincode: string;
  };
  hotspotDetails: {
    isHotspot: boolean;
    hotspotId: string;
    hotspotName: string;
    fare: number;
  };
  rateDetails: ApiRateDetails[];
};

const money = (n: number, country: string) => {
  if (country.toLowerCase() === "india") return `₹${n}`;
  if (country.toLowerCase() === "usa") return `$${n}`;
  return `${n}`; // fallback
};

const pad = (n: number) => String(n).padStart(2, "0");
const asTime = (h: number, type: "AM" | "PM") => `${pad(h)}:00 ${type}`;
const cap = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const flattenApiItem = (item: ApiItem, keyPrefix: string): PriceSetting[] => {
  const { country, state, district, area, pincode } = item.location;
  const { isHotspot, hotspotId, hotspotName, fare } = item.hotspotDetails;

  const rows: PriceSetting[] = [];
  let i = 0;

  item.rateDetails.forEach((rd) => {
    rd.timing.forEach((t) => {
      rows.push({
        key: `${keyPrefix}-${i++}`,
        country,
        state,
        district,
        area,
        pincode,
        hotspotName,
        hotspotId,
        isHotspot,
        baseFare: money(fare, country),
        driverType: rd.driverType,
        cancellationFee: money(rd.cancellationFee, country),
        waitingFee: `${rd.waitingFee.perMinutes}min / ${money(
          rd.waitingFee.fee,
          country
        )}`,
        day: cap(t.day),
        timeRange: `${asTime(t.from.time, t.from.type)} - ${asTime(
          t.to.time,
          t.to.type
        )}`,
        rateRange: String(t.rate),
      });
    });
  });

  return rows;
};

const apiResponse: ApiItem[] = [
  {
    location: {
      country: "India",
      state: "Tamilnadu",
      district: "Kanchipuram",
      area: "Madippakkam",
      pincode: "60091",
    },
    hotspotDetails: {
      isHotspot: true,
      hotspotId: "HYU1235",
      hotspotName: "Rush Zone",
      fare: 40,
    },
    rateDetails: [
      {
        driverType: "normal",
        cancellationFee: 5,
        waitingFee: { perMinutes: 1, fee: 2 },
        timing: [
          {
            day: "monday",
            from: { time: 5, type: "AM" },
            to: { time: 7, type: "AM" },
            rate: 300,
          },
          {
            day: "monday",
            from: { time: 7, type: "AM" },
            to: { time: 9, type: "AM" },
            rate: 340,
          },
        ],
      },
      {
        driverType: "premium",
        cancellationFee: 8,
        waitingFee: { perMinutes: 1, fee: 3 },
        timing: [
          {
            day: "saturday",
            from: { time: 4, type: "PM" },
            to: { time: 8, type: "PM" },
            rate: 420,
          },
        ],
      },
      {
        driverType: "elite",
        cancellationFee: 12,
        waitingFee: { perMinutes: 2, fee: 5 },
        timing: [
          {
            day: "friday",
            from: { time: 7, type: "PM" },
            to: { time: 11, type: "PM" },
            rate: 600,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Maharashtra",
      district: "Mumbai",
      area: "Andheri",
      pincode: "400053",
    },
    hotspotDetails: {
      isHotspot: true,
      hotspotId: "MUM6789",
      hotspotName: "City Center",
      fare: 55,
    },
    rateDetails: [
      {
        driverType: "premium",
        cancellationFee: 10,
        waitingFee: { perMinutes: 2, fee: 4 },
        timing: [
          {
            day: "tuesday",
            from: { time: 8, type: "AM" },
            to: { time: 11, type: "AM" },
            rate: 450,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Delhi",
      district: "South Delhi",
      area: "Saket",
      pincode: "110017",
    },
    hotspotDetails: {
      isHotspot: false,
      hotspotId: "DEL5566",
      hotspotName: "Metro Point",
      fare: 35,
    },
    rateDetails: [
      {
        driverType: "normal",
        cancellationFee: 6,
        waitingFee: { perMinutes: 1, fee: 2 },
        timing: [
          {
            day: "wednesday",
            from: { time: 6, type: "AM" },
            to: { time: 10, type: "AM" },
            rate: 320,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Karnataka",
      district: "Bangalore",
      area: "Whitefield",
      pincode: "560066",
    },
    hotspotDetails: {
      isHotspot: true,
      hotspotId: "BLR2233",
      hotspotName: "Tech Park",
      fare: 50,
    },
    rateDetails: [
      {
        driverType: "elite",
        cancellationFee: 12,
        waitingFee: { perMinutes: 2, fee: 5 },
        timing: [
          {
            day: "friday",
            from: { time: 7, type: "PM" },
            to: { time: 11, type: "PM" },
            rate: 600,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Kerala",
      district: "Kochi",
      area: "Marine Drive",
      pincode: "682031",
    },
    hotspotDetails: {
      isHotspot: false,
      hotspotId: "KOC8899",
      hotspotName: "Harbour View",
      fare: 30,
    },
    rateDetails: [
      {
        driverType: "normal",
        cancellationFee: 4,
        waitingFee: { perMinutes: 1, fee: 1 },
        timing: [
          {
            day: "sunday",
            from: { time: 10, type: "AM" },
            to: { time: 2, type: "PM" },
            rate: 280,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Gujarat",
      district: "Ahmedabad",
      area: "Navrangpura",
      pincode: "380009",
    },
    hotspotDetails: {
      isHotspot: true,
      hotspotId: "AMD7788",
      hotspotName: "Heritage Circle",
      fare: 45,
    },
    rateDetails: [
      {
        driverType: "premium",
        cancellationFee: 8,
        waitingFee: { perMinutes: 1, fee: 3 },
        timing: [
          {
            day: "saturday",
            from: { time: 4, type: "PM" },
            to: { time: 8, type: "PM" },
            rate: 420,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Punjab",
      district: "Amritsar",
      area: "Golden Temple",
      pincode: "143006",
    },
    hotspotDetails: {
      isHotspot: true,
      hotspotId: "AMR4455",
      hotspotName: "Temple Square",
      fare: 60,
    },
    rateDetails: [
      {
        driverType: "normal",
        cancellationFee: 7,
        waitingFee: { perMinutes: 1, fee: 2 },
        timing: [
          {
            day: "thursday",
            from: { time: 5, type: "AM" },
            to: { time: 9, type: "AM" },
            rate: 350,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Rajasthan",
      district: "Jaipur",
      area: "Pink City",
      pincode: "302002",
    },
    hotspotDetails: {
      isHotspot: false,
      hotspotId: "JPR9988",
      hotspotName: "Hawa Mahal",
      fare: 38,
    },
    rateDetails: [
      {
        driverType: "premium",
        cancellationFee: 9,
        waitingFee: { perMinutes: 2, fee: 4 },
        timing: [
          {
            day: "wednesday",
            from: { time: 6, type: "PM" },
            to: { time: 10, type: "PM" },
            rate: 480,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "Telangana",
      district: "Hyderabad",
      area: "Hitech City",
      pincode: "500081",
    },
    hotspotDetails: {
      isHotspot: true,
      hotspotId: "HYD6677",
      hotspotName: "Cyber Towers",
      fare: 52,
    },
    rateDetails: [
      {
        driverType: "elite",
        cancellationFee: 15,
        waitingFee: { perMinutes: 2, fee: 6 },
        timing: [
          {
            day: "monday",
            from: { time: 9, type: "AM" },
            to: { time: 1, type: "PM" },
            rate: 700,
          },
        ],
      },
    ],
  },
  {
    location: {
      country: "India",
      state: "West Bengal",
      district: "Kolkata",
      area: "Park Street",
      pincode: "700016",
    },
    hotspotDetails: {
      isHotspot: false,
      hotspotId: "KOL3344",
      hotspotName: "Music Square",
      fare: 42,
    },
    rateDetails: [
      {
        driverType: "normal",
        cancellationFee: 6,
        waitingFee: { perMinutes: 1, fee: 2 },
        timing: [
          {
            day: "friday",
            from: { time: 3, type: "PM" },
            to: { time: 7, type: "PM" },
            rate: 310,
          },
        ],
      },
    ],
  },
];

const PricingAndFareRules: React.FC = () => {
  const [filterForm] = Form.useForm<FilterValues>();

  // put this near your other helpers
  const dedupeRows = (rows: PriceSetting[]) => {
    const num = (s: string) =>
      parseFloat((s || "").toString().replace(/[^\d.]/g, "")) || 0;

    const timeToMinutes = (hhmmAmPm: string) => {
      const m = hhmmAmPm.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!m) return null;
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      const ampm = m[3].toUpperCase();
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + min;
    };

    const signature = (r: PriceSetting) => {
      const [fromStr, toStr] = (r.timeRange || "")
        .split("-")
        .map((s) => s.trim());
      const fromMin = fromStr ? timeToMinutes(fromStr) : "";
      const toMin = toStr ? timeToMinutes(toStr) : "";
      return [
        (r.country || "").toLowerCase().trim(),
        (r.state || "").toLowerCase().trim(),
        (r.district || "").toLowerCase().trim(),
        (r.area || "").toLowerCase().trim(),
        (r.pincode || "").toLowerCase().trim(),
        (r.hotspotId || "").toLowerCase().trim(),
        (r.driverType || "").toLowerCase().trim(),
        (r.day || "").toLowerCase().trim(),
        fromMin,
        toMin,
        num(r.baseFare),
        num(r.cancellationFee),
        num(r.rateRange),
        (() => {
          const m = (r.waitingFee || "").match(
            /(\d+)\s*min\s*\/\s*[^0-9]*([\d.]+)/i
          );
          return m ? `${m[1]}|${m[2]}` : "";
        })(),
      ].join("|");
    };

    const seen = new Set<string>();
    return rows.filter((r) => {
      const sig = signature(r);
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  };

  const initialTableData: PriceSetting[] = useMemo(() => {
    const rows = apiResponse.flatMap((item, idx) =>
      flattenApiItem(item, `row${idx}`)
    );
    return dedupeRows(rows);
  }, [apiResponse]);

  const [filteredTableData, setFilteredTableData] =
    useState<PriceSetting[]>(initialTableData);
  const [activeFilterPanel, setActiveFilterPanel] = useState<string | string[]>(
    ["advanced-filters"]
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentPriceSetting, setCurrentPriceSetting] =
    useState<PriceSetting | null>(null);

  const applyFilters = (values: FilterValues) => {
    let tempData = initialTableData;

    if (values.country) {
      const v = values.country.toLowerCase();
      tempData = tempData.filter((item) =>
        item.country.toLowerCase().includes(v)
      );
    }
    if (values.state) {
      const v = values.state.toLowerCase();
      tempData = tempData.filter((item) =>
        item.state.toLowerCase().includes(v)
      );
    }
    if (values.district) {
      const v = values.district.toLowerCase();
      tempData = tempData.filter((item) =>
        item.district.toLowerCase().includes(v)
      );
    }
    if (values.area) {
      const v = values.area.toLowerCase();
      tempData = tempData.filter((item) => item.area.toLowerCase().includes(v));
    }
    if (values.pincode) {
      const v = values.pincode.toLowerCase();
      tempData = tempData.filter((item) =>
        item.pincode.toLowerCase().includes(v)
      );
    }
    if (values.isHotspot !== undefined) {
      tempData = tempData.filter((item) => item.isHotspot === values.isHotspot);
    }
    if (values.hotspotId) {
      const v = values.hotspotId.toLowerCase();
      tempData = tempData.filter((item) =>
        item.hotspotId.toLowerCase().includes(v)
      );
    }
    if (values.hotspotName) {
      const v = values.hotspotName.toLowerCase();
      tempData = tempData.filter((item) =>
        item.hotspotName.toLowerCase().includes(v)
      );
    }
    if (values.driverType) {
      const v = values.driverType.toLowerCase();
      tempData = tempData.filter((item) => item.driverType.toLowerCase() === v);
    }
    if (values.dayOfWeek) {
      const v = values.dayOfWeek.toLowerCase();
      tempData = tempData.filter((item) => item.day.toLowerCase() === v);
    }
    if (
      values.baseFareRangeMin !== undefined ||
      values.baseFareRangeMax !== undefined
    ) {
      const min = values.baseFareRangeMin ?? Number.NEGATIVE_INFINITY;
      const max = values.baseFareRangeMax ?? Number.POSITIVE_INFINITY;
      tempData = tempData.filter((item) => {
        const num = parseFloat(item.baseFare.replace(/[^\d.]/g, "")) || 0;
        return num >= min && num <= max;
      });
    }
    if (
      values.cancellationFeeRangeMin !== undefined ||
      values.cancellationFeeRangeMax !== undefined
    ) {
      const min = values.cancellationFeeRangeMin ?? Number.NEGATIVE_INFINITY;
      const max = values.cancellationFeeRangeMax ?? Number.POSITIVE_INFINITY;
      tempData = tempData.filter((item) => {
        const num =
          parseFloat(item.cancellationFee.replace(/[^\d.]/g, "")) || 0;
        return num >= min && num <= max;
      });
    }
    if (
      values.waitingFeePerMinMin !== undefined ||
      values.waitingFeePerMinMax !== undefined ||
      values.waitingFeeAmountMin !== undefined ||
      values.waitingFeeAmountMax !== undefined
    ) {
      const perMinMin = values.waitingFeePerMinMin ?? Number.NEGATIVE_INFINITY;
      const perMinMax = values.waitingFeePerMinMax ?? Number.POSITIVE_INFINITY;
      const amtMin = values.waitingFeeAmountMin ?? Number.NEGATIVE_INFINITY;
      const amtMax = values.waitingFeeAmountMax ?? Number.POSITIVE_INFINITY;

      tempData = tempData.filter((item, idx) => {
        const raw = item.waitingFee ?? "";
        const m = raw.match(/(\d+)\s*min\s*\/\s*[^0-9]*([\d.,]+)/i);
        if (!m) {
          console.log(
            `[waitingFee] row ${idx} (${item.hotspotId}) → NO MATCH`,
            { raw }
          );
          return false;
        }
        const per = parseInt(m[1], 10);
        const feeStr = m[2].replace(/,/g, "").trim();
        const fee = parseFloat(feeStr);
        if (!Number.isFinite(fee)) {
          console.log(`[waitingFee] row ${idx} (${item.hotspotId}) → BAD FEE`, {
            raw,
            feeStr,
          });
          return false;
        }
        const pass =
          per >= perMinMin &&
          per <= perMinMax &&
          fee >= amtMin &&
          fee <= amtMax;
        console.log(`[waitingFee] row ${idx} (${item.hotspotId})`, {
          raw,
          per,
          fee,
          thresholds: { perMinMin, perMinMax, amtMin, amtMax },
          pass,
        });
        return pass;
      });
    }

    if (
      values.rateRangeMin !== undefined ||
      values.rateRangeMax !== undefined
    ) {
      const min = values.rateRangeMin ?? Number.NEGATIVE_INFINITY;
      const max = values.rateRangeMax ?? Number.POSITIVE_INFINITY;
      tempData = tempData.filter((item) => {
        const num = parseFloat(item.rateRange.replace(/[^\d.]/g, "")) || 0;
        return num >= min && num <= max;
      });
    }

    if (values.timeFrom || values.timeTo) {
      console.log("timeFrom raw ->", values.timeFrom);
      console.log("timeTo   raw ->", values.timeTo);

      const dayMinutes = 24 * 60;

      const fromMin = toMinutesFromAny(values.timeFrom) ?? 0;
      const toMin = toMinutesFromAny(values.timeTo) ?? dayMinutes;

      console.log("timeFrom mins ->", fromMin, "timeTo mins ->", toMin);

      // single-time behavior (containment) when only one side set
      tempData = tempData.filter((item, idx) => {
        const [rStart, rEnd] = parseRowRangeToMinutes(item.timeRange);

        let keep: boolean;
        if (values.timeFrom && !values.timeTo) {
          keep = fromMin >= rStart && fromMin < rEnd;
          console.log(
            `[time-filter][from-only] ${item.hotspotId} | "${item.timeRange}"`,
            { fromMin, rStart, rEnd, keep }
          );
        } else if (!values.timeFrom && values.timeTo) {
          keep = toMin > rStart && toMin <= rEnd;
          console.log(
            `[time-filter][to-only] ${item.hotspotId} | "${item.timeRange}"`,
            { toMin, rStart, rEnd, keep }
          );
        } else {
          const fStart = Math.min(fromMin, toMin);
          const fEnd = Math.max(fromMin, toMin);
          keep = Math.max(fStart, rStart) <= Math.min(fEnd, rEnd);
          console.log(
            `[time-filter][range] ${item.hotspotId} | "${item.timeRange}"`,
            { fStart, fEnd, rStart, rEnd, keep }
          );
        }
        return keep;
      });
    }

    setFilteredTableData(tempData);
  };

  // "05:00 AM" -> minutes since midnight
  const clockToMinutes = (s: string): number => {
    const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return 0;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return h * 60 + min;
  };

  const parseRowRangeToMinutes = (range: string): [number, number] => {
    const clean = (range || "").replace(/\u00A0/g, " ").trim();
    const [fromStr, toStr] = clean.split(/\s*-\s*/);
    const start = clockToMinutes((fromStr || "12:00 AM").trim());
    const end = clockToMinutes((toStr || "11:59 PM").trim());
    return [start, end];
  };

  const toMinutesFromAny = (
    v: Date | number | string | null | undefined
  ): number | null => {
    if (v == null) return null;
    if (v instanceof Date) return getHours(v) * 60 + getMinutes(v);
    if (typeof v === "number") {
      const d = new Date(v);
      return Number.isNaN(d.getTime())
        ? null
        : getHours(d) * 60 + getMinutes(d);
    }
    if (typeof v === "string") {
      let m = v.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (m) return clockToMinutes(v);
      m = v.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
      const t = Date.parse(v);
      if (!Number.isNaN(t)) {
        const hasZ = /Z$/i.test(v);
        const d = new Date(t);
        return hasZ
          ? d.getUTCHours() * 60 + d.getUTCMinutes()
          : getHours(d) * 60 + getMinutes(d);
      }
    }
    return null;
  };

  const rangesOverlapInclusive = (
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ) => Math.max(start1, start2) <= Math.min(end1, end2);

  const handleClearAllFilters = () => {
    filterForm.resetFields();
    setFilteredTableData(initialTableData);
    console.log("Filters Cleared!");
  };

  const onFilterValuesChange = (
    _changedValues: any,
    allValues: FilterValues
  ) => {
    applyFilters(allValues);
  };

  const showDrawer = (record: PriceSetting) => {
    setCurrentPriceSetting(record);
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setCurrentPriceSetting(null);
  };

  // ===== EXPORT HELPERS =====
  const exportHeaders = [
    { key: "country", title: "Country" },
    { key: "state", title: "State" },
    { key: "district", title: "District" },
    { key: "area", title: "Area" },
    { key: "pincode", title: "Pincode" },
    { key: "hotspotName", title: "Hotspot Name" },
    { key: "hotspotId", title: "Hotspot ID" },
    { key: "isHotspot", title: "Is Hotspot" },
    { key: "baseFare", title: "Base Fare" },
    { key: "driverType", title: "Driver Type" },
    { key: "cancellationFee", title: "Cancellation Fee" },
    { key: "waitingFee", title: "Waiting Fee" },
    { key: "day", title: "Day" },
    { key: "timeRange", title: "Time Range" },
    { key: "rateRange", title: "Rate Range" },
  ] as const;

  type ExportRow = {
    [K in (typeof exportHeaders)[number]["key"]]: string | number | boolean;
  };

  const buildExportRows = (rows: PriceSetting[]): ExportRow[] =>
    rows.map((r) => ({
      country: r.country,
      state: r.state,
      district: r.district,
      area: r.area,
      pincode: r.pincode,
      hotspotName: r.hotspotName,
      hotspotId: r.hotspotId,
      isHotspot: r.isHotspot ? "Yes" : "No",
      baseFare: r.baseFare,
      driverType: r.driverType,
      cancellationFee: r.cancellationFee,
      waitingFee: r.waitingFee,
      day: r.day,
      timeRange: r.timeRange,
      rateRange: r.rateRange,
    }));

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const rows = buildExportRows(filteredTableData);
    const headerLine = exportHeaders
      .map((h) => `"${h.title.replace(/"/g, '""')}"`)
      .join(",");
    const bodyLines = rows.map((row) =>
      exportHeaders
        .map((h) => {
          const v = (row as any)[h.key];
          const s = v == null ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csv = [headerLine, ...bodyLines].join("\r\n");
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `driver_price_settings.csv`
    );
  };

  const handleDownloadExcel = () => {
    const rows = buildExportRows(filteredTableData);
    const ws = utils.json_to_sheet(rows, {
      header: exportHeaders.map((h) => h.key) as any,
    });
    // set header titles
    exportHeaders.forEach((h, idx) => {
      const cell = utils.encode_cell({ r: 0, c: idx });
      (ws as any)[cell] = { t: "s", v: h.title };
    });
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Price Settings");
    writeFile(wb, "driver_price_settings.xlsx");
  };
  // ===== END EXPORT HELPERS =====

  const columns = [
    { title: "Country", dataIndex: "country", key: "country" },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "District", dataIndex: "district", key: "district" },
    { title: "Area", dataIndex: "area", key: "area" },
    { title: "Pincode", dataIndex: "pincode", key: "pincode" },
    { title: "Hotspot Name", dataIndex: "hotspotName", key: "hotspotName" },
    { title: "Hotspot ID", dataIndex: "hotspotId", key: "hotspotId" },
    {
      title: "Is Hotspot",
      dataIndex: "isHotspot",
      key: "isHotspot",
      render: (value: boolean) => (
        <span
          style={{
            backgroundColor: value ? "#1677ff" : "#d9d9d9",
            color: value ? "#fff" : "#000",
            borderRadius: 6,
            padding: "2px 10px",
            display: "inline-block",
            lineHeight: 1.4,
          }}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
    { title: "Base Fare", dataIndex: "baseFare", key: "baseFare" },
    {
      title: "Driver Type",
      dataIndex: "driverType",
      key: "driverType",
      render: (type: string) => {
        const t = type.toLowerCase();
        let style: React.CSSProperties = {
          borderRadius: 6,
          padding: "2px 10px",
          display: "inline-block",
          lineHeight: 1.4,
        };

        if (t === "elite") {
          style = { ...style, backgroundColor: "#1677ff", color: "#fff" }; // blue
        } else if (t === "premium") {
          style = { ...style, backgroundColor: "#d9d9d9", color: "#000" }; // grey
        } else {
          // normal
          style = {
            ...style,
            border: "1px solid #d9d9d9",
            backgroundColor: "transparent",
            color: "#000",
          };
        }

        return <span style={style}>{type}</span>;
      },
    },
    {
      title: "Cancellation Fee",
      dataIndex: "cancellationFee",
      key: "cancellationFee",
    },
    { title: "Waiting Fee", dataIndex: "waitingFee", key: "waitingFee" },
    { title: "Day", dataIndex: "day", key: "day" },
    { title: "Time Range", dataIndex: "timeRange", key: "timeRange" },
    { title: "Rate Range", dataIndex: "rateRange", key: "rateRange" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PriceSetting) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showDrawer(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          width: "100%",
          backgroundColor: "rgb(41 121 245)",
          display: "flex",
          paddingTop: "1rem",
          paddingBottom: "1rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: ".5rem" }}>
          <div
            style={{
              padding: ".5rem",
              backgroundColor: "#fff3",
              borderRadius: "10px",
              color: "rgb(255, 255, 255)",
              fontSize: "1.5rem",
              marginBottom: "auto",
            }}
          >
            <SettingOutlined />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "rgb(255 255 255",
                lineHeight: "1rem",
              }}
            >
              Driver Price Management
            </h1>
            <p style={{ color: "#fffc", fontSize: ".875rem;" }}>
              Advanced admin interface for pricing control
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "normal",
            color: "rgb(255, 255, 255)",
          }}
        >
          <div style={{ display: "flex", gap: ".3rem" }}>
            <FiUsers />
            {filteredTableData.length} Settings
          </div>
          <div style={{ display: "flex", gap: ".3rem" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-trending-up h-5 w-5"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
            <p>Active</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, backgroundColor: "white" }}>
        <Collapse
          activeKey={activeFilterPanel}
          onChange={(key) => setActiveFilterPanel(key)}
          style={{ marginBottom: 24, backgroundColor: "white" }}
          expandIconPosition="right"
        >
          <Panel
            header={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FilterOutlined />
                <span
                  style={{
                    fontSize: "1.125rem",
                    lineHeight: "1.75rem",
                    fontWeight: 600,
                  }}
                >
                  Advanced Filters
                </span>
              </div>
            }
            key="advanced-filters"
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button
                  type="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClearAllFilters();
                  }}
                >
                  Clear All
                </Button>
              </div>
            }
          >
            <Form
              form={filterForm}
              name="advanced_filters"
              onValuesChange={onFilterValuesChange}
              layout="vertical"
              initialValues={{
                baseFareRangeMin: 0,
                baseFareRangeMax: 1000,
                cancellationFeeRangeMin: 0,
                cancellationFeeRangeMax: 100,
                waitingFeePerMinMin: 0,
                waitingFeePerMinMax: 10,
                waitingFeeAmountMin: 0,
                waitingFeeAmountMax: 20,
                rateRangeMin: 0,
                rateRangeMax: 1000,
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="country" label="Country">
                    <Select placeholder="Select country">
                      <Option value="india">India</Option>
                      <Option value="usa">USA</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="state" label="State">
                    <Input placeholder="Enter state" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="district" label="District">
                    <Input placeholder="Enter district" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="area" label="Area">
                    <Input placeholder="Enter area" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="pincode" label="Pincode">
                    <Input placeholder="Enter pincode" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="isHotspot" label="Is Hotspot">
                    <Radio.Group>
                      <Radio value={true}>Yes</Radio>
                      <Radio value={false}>No</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="hotspotId" label="Hotspot ID">
                    <Input placeholder="Enter hotspot ID" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="hotspotName" label="Hotspot Name">
                    <Input placeholder="Enter hotspot name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="Base Fare Range">
                    <Input.Group compact>
                      <Form.Item name="baseFareRangeMin" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="0"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                      <Form.Item name="baseFareRangeMax" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="1000"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="driverType" label="Driver Type">
                    <Select placeholder="Select driver type">
                      <Option value="normal">Normal</Option>
                      <Option value="premium">Premium</Option>
                      <Option value="elite">Elite</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="Cancellation Fee Range">
                    <Input.Group compact>
                      <Form.Item name="cancellationFeeRangeMin" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="0"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                      <Form.Item name="cancellationFeeRangeMax" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="100"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="Waiting Fee (Per Min)">
                    <Input.Group compact>
                      <Form.Item name="waitingFeePerMinMin" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="0"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                      <Form.Item name="waitingFeePerMinMax" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="10"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="Waiting Fee Amount">
                    <Input.Group compact>
                      <Form.Item name="waitingFeeAmountMin" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="0"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                      <Form.Item name="waitingFeeAmountMax" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="20"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="dayOfWeek" label="Day of Week">
                    <Select placeholder="Select day">
                      <Option value="monday">Monday</Option>
                      <Option value="tuesday">Tuesday</Option>
                      <Option value="wednesday">Wednesday</Option>
                      <Option value="thursday">Thursday</Option>
                      <Option value="friday">Friday</Option>
                      <Option value="saturday">Saturday</Option>
                      <Option value="sunday">Sunday</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="timeFrom" label="Time From">
                    {/* CHANGED: 12-hour mode + AM/PM */}
                    <DatePicker.TimePicker
                      style={{ width: "100%" }}
                      use12Hours
                      format="hh:mm A"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="timeTo" label="Time To">
                    {/* CHANGED: 12-hour mode + AM/PM */}
                    <DatePicker.TimePicker
                      style={{ width: "100%" }}
                      use12Hours
                      format="hh:mm A"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="Rate Range">
                    <Input.Group compact>
                      <Form.Item name="rateRangeMin" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="0"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                      <Form.Item name="rateRangeMax" noStyle>
                        <InputNumber
                          min={0}
                          placeholder="50"
                          style={{ width: "50%" }}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Panel>
        </Collapse>

        <Card
          title="Driver Price Settings"
          extra={
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadCSV}>
                CSV
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadExcel}>
                Excel
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredTableData}
            pagination={{ pageSize: 5 }}
            scroll={{ x: "max-content" }}
          />
        </Card>

        <Drawer
          title="Pricing Details"
          width={450}
          onClose={onCloseDrawer}
          open={drawerVisible}
          destroyOnClose
        >
          {currentPriceSetting ? (
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Title
                level={5}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <img
                  src="https://img.icons8.com/ios/50/000000/marker.png"
                  alt="location icon"
                  style={{ width: 20, height: 20 }}
                />
                Location Information
              </Title>
              <Descriptions
                column={1}
                size="small"
                colon={false}
                layout="horizontal"
              >
                <Descriptions.Item label="Country">
                  {currentPriceSetting.country}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {currentPriceSetting.state}
                </Descriptions.Item>
                <Descriptions.Item label="District">
                  {currentPriceSetting.district}
                </Descriptions.Item>
                <Descriptions.Item label="Area">
                  {currentPriceSetting.area}
                </Descriptions.Item>
                <Descriptions.Item label="Pincode">
                  {currentPriceSetting.pincode}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title
                level={5}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <img
                  src="https://img.icons8.com/ios/50/000000/fire-station.png"
                  alt="hotspot icon"
                  style={{ width: 20, height: 20 }}
                />
                Hotspot Details
              </Title>
              <Descriptions
                column={1}
                size="small"
                colon={false}
                layout="horizontal"
              >
                <Descriptions.Item label="Hotspot ID">
                  {currentPriceSetting.hotspotId}
                </Descriptions.Item>
                <Descriptions.Item label="Hotspot Name">
                  {currentPriceSetting.hotspotName}
                </Descriptions.Item>
                <Descriptions.Item label="Is Hotspot">
                  {currentPriceSetting.isHotspot ? "Yes" : "No"}
                </Descriptions.Item>
                <Descriptions.Item label="Base Fare">
                  {currentPriceSetting.baseFare}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title
                level={5}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <img
                  src="https://img.icons8.com/ios/50/000000/card-in-use.png"
                  alt="rate icon"
                  style={{ width: 20, height: 20 }}
                />
                Rate Details
              </Title>

              <Card
                size="small"
                title={`${currentPriceSetting.driverType.toUpperCase()} DRIVER`}
                style={{ marginTop: 16 }}
              >
                <Space direction="vertical">
                  <Text strong>
                    Cancellation Fee: {currentPriceSetting.cancellationFee}
                  </Text>
                  <Text strong>
                    Waiting Fee: {currentPriceSetting.waitingFee}
                  </Text>
                </Space>
              </Card>

              <Title level={5} style={{ marginTop: 16 }}>
                Time-based Rates
              </Title>
              <Card size="small">
                <Descriptions
                  column={1}
                  size="small"
                  colon={false}
                  layout="horizontal"
                >
                  <Descriptions.Item label="Day">
                    {currentPriceSetting.day}
                  </Descriptions.Item>
                  <Descriptions.Item label="Time Range">
                    {currentPriceSetting.timeRange}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rate Range">
                    {currentPriceSetting.rateRange}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          ) : (
            <p>No pricing details selected.</p>
          )}
        </Drawer>
      </div>
    </>
  );
};

export default PricingAndFareRules;
