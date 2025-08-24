import { type Level } from '../../types.ts';
import { unitOne } from '../units/level_1/unit_1.ts';
import { unitTwo } from '../units/level_1/unit_2.ts';
import { unitThree } from '../units/level_1/unit_3.ts';
import { unitFour } from '../units/level_1/unit_4.ts';
import { unitFive } from '../units/level_1/unit_5.ts';
import { unitSix } from '../units/level_1/unit_6.ts';
import { unitSeven } from '../units/level_1/unit_7.ts';
import { unitEight } from '../units/level_1/unit_8.ts';

export const levelOneData: Level = {
      level_id: 1,
      title: "الغفلة التامّة وانعدام الحضور",
      is_unlocked: true,
      units: [
        unitOne,
        unitTwo,
        unitThree,
        unitFour,
        unitFive,
        unitSix,
        unitSeven,
        unitEight,
      ]
};
