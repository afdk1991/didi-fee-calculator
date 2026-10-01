// 全模式计费验证
const PRESETS = {
  general: {
    includeKm:5, overMode:'unit', overPrice:3.5,
    tiers:[{s:6,e:22,fee:18},{s:22,e:24,fee:28},{s:0,e:6,fee:28}],
    freeWait:10, waitFee:1, waitCap:null,
    parking:{ fee:29, includeKm:1 }
  },
  didi: {
    includeKm:8, overMode:'unit', overPrice:3.5,
    tiers:[{s:6,e:22,fee:35},{s:22,e:23,fee:50},{s:23,e:24,fee:65},{s:0,e:6,fee:85}],
    freeWait:10, waitFee:1, waitCap:180,
    long:{ packages:[{fee:236,km:300,hours:4},{fee:496,km:600,hours:24}], overBlockKm:20, overBlockFee:20, freeWait:30, waitFee:1 },
    parking:{ fee:29, includeKm:1 }
  },
  edaijia: {
    includeKm:10, overMode:'block', blockKm:10, blockFee:20,
    tiers:[{s:7,e:22,fee:40},{s:22,e:23,fee:60},{s:23,e:24,fee:80},{s:0,e:7,fee:100}],
    freeWait:10, waitFee:1, waitCap:null,
    long:{ packages:[{fee:121,km:30,hours:0}], overBlockKm:10, overBlockFee:20, freeWait:30, waitFee:20 },
    business:{ baseFee:300, baseHours:8, workStart:9, workEnd:18, overtimeFee:40, overtimeLimit:22, minHours:8 }
  }
};
function calcNormal(rate, dist, wait, hour, opt){
  opt = opt || {};
  const surgePct = opt.surgePct || 0;
  const toll = opt.toll || 0, park = opt.park || 0, pickup = opt.pickup || 0;
  let tier = rate.tiers[0];
  for(const t of rate.tiers){
    if(t.s<t.e){ if(hour>=t.s&&hour<t.e){tier=t;break;} }
    else { if(hour>=t.s||hour<t.e){tier=t;break;} }
  }
  let kmFee=0;
  const over=dist-rate.includeKm;
  if(over>0){
    if(rate.overMode==='unit') kmFee = Math.ceil(over*10)/10 * rate.overPrice;
    else kmFee = Math.ceil(over/rate.blockKm)*rate.blockFee;
  }
  const waitFee = Math.min(Math.max(0,wait-rate.freeWait)*rate.waitFee, rate.waitCap||Infinity);
  const base = tier.fee + kmFee + waitFee;
  const surgeAmt = base * surgePct/100;
  return base + pickup + surgeAmt + toll + park;
}

// 代泊车：一口价 + 超里程（沿用日常 overMode/overPrice）
function calcParking(rate, dist, opt){
  opt = opt || {};
  const P = rate.parking;
  const surgePct = opt.surgePct || 0;
  const toll = opt.toll || 0, park = opt.park || 0, pickup = opt.pickup || 0;
  let kmFee=0;
  const over = dist - P.includeKm;
  if(over>0){
    if(rate.overMode==='unit') kmFee = Math.ceil(over*10)/10 * rate.overPrice;
    else kmFee = Math.ceil(over/rate.blockKm)*rate.blockFee;
  }
  const base = P.fee + kmFee;
  const surgeAmt = base * surgePct/100;
  return base + pickup + surgeAmt + toll + park;
}
function calcLong(rate, dist, wait, pkgIdx){
  const L = rate.long;
  const pkg = L.packages[pkgIdx];
  let kmFee = 0;
  const over = dist - pkg.km;
  if(over>0) kmFee = Math.ceil(over/L.overBlockKm) * L.overBlockFee;
  const waitFee = Math.max(0,wait-L.freeWait)*L.waitFee;
  return pkg.fee + kmFee + waitFee;
}
function calcBusiness(rate, hours){
  const B = rate.business;
  const hrs = Math.max(B.minHours, hours);
  let extra = 0;
  if(hours > B.baseHours){
    const overH = Math.min(hours - B.baseHours, B.overtimeLimit - B.workEnd);
    extra = overH * B.overtimeFee;
  }
  return B.baseFee + extra;
}
const cases = [
  // 日常
  ['滴滴日常 10km白天',      calcNormal(PRESETS.didi, 10,0,12), 42],
  ['滴滴日常 20km白天',      calcNormal(PRESETS.didi, 20,0,12), 77],
  ['E代驾日常 15km',         calcNormal(PRESETS.edaijia, 15,0,12), 60],
  // 滴滴长途
  ['滴滴长途 4h套餐 200km',   calcLong(PRESETS.didi, 200,0,0), 236],
  ['滴滴长途 4h套餐 350km',   calcLong(PRESETS.didi, 350,0,0), 236 + Math.ceil(50/20)*20], // 超50km=3段
  ['滴滴长途 全天套餐 700km', calcLong(PRESETS.didi, 700,0,1), 496 + Math.ceil(100/20)*20],
  ['滴滴长途 等候40分钟',    calcLong(PRESETS.didi, 200,40,0), 236 + 10],
  // E代驾长途
  ['E代驾长途 30km内',       calcLong(PRESETS.edaijia, 30,0,0), 121],
  ['E代驾长途 50km 超20km=2段', calcLong(PRESETS.edaijia, 50,0,0), 121 + 2*20],
  ['E代驾长途 等候40分钟',   calcLong(PRESETS.edaijia, 30,40,0), 121 + 10*20],
  // E代驾商务
  ['E代驾商务 8小时内',       calcBusiness(PRESETS.edaijia, 8), 300],
  ['E代驾商务 7小时按8h计',   calcBusiness(PRESETS.edaijia, 7), 300],
  ['E代驾商务 9小时超时1h',   calcBusiness(PRESETS.edaijia, 9), 340],
  ['E代驾商务 12小时超时4h=到22点封顶', calcBusiness(PRESETS.edaijia, 12), 300 + 4*40],
  ['E代驾商务 14小时仍封顶22点', calcBusiness(PRESETS.edaijia, 14), 300 + 4*40],
  // 通用代驾
  ['通用日常 10km白天',      calcNormal(PRESETS.general, 10,0,12), 35.5],
  ['通用日常 10km夜间',      calcNormal(PRESETS.general, 10,0,23), 45.5],
  ['通用日常 5km边界含内',    calcNormal(PRESETS.general, 5,0,12), 18],
  // 代泊车（滴滴）
  ['滴滴代泊车 10km超9km',   calcParking(PRESETS.didi, 10), 60.5],
  ['滴滴代泊车 1km内',       calcParking(PRESETS.didi, 1), 29],
  // 动态加价 + 实报费用（与网页 calc 逻辑对齐）
  ['滴滴日常 10km +加价10%', calcNormal(PRESETS.didi, 10,0,12,{surgePct:10}), 46.2],
  ['滴滴日常 10km +路桥10',  calcNormal(PRESETS.didi, 10,0,12,{toll:10}), 52],
  ['滴滴日常 10km +停车5',   calcNormal(PRESETS.didi, 10,0,12,{park:5}), 47],
  ['滴滴日常 10km +接驾8',   calcNormal(PRESETS.didi, 10,0,12,{pickup:8}), 50],
  ['滴滴日常 10km 全费用',   calcNormal(PRESETS.didi, 10,0,12,{surgePct:10,toll:10,park:5,pickup:8}), 69.2],
];
let pass=0, fail=0;
for(const [d, got, exp] of cases){
  const ok = Math.abs(got-exp)<1e-6;
  console.log(`${ok?'PASS':'FAIL'}  ${d}  期望=${exp.toFixed(2)}  实得=${got.toFixed(2)}`);
  ok?pass++:fail++;
}
console.log(`\n通过 ${pass}/${cases.length}${fail?`，失败 ${fail}`:''}`);
process.exit(fail?1:0);
