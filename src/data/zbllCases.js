/**
 * Complete 472 ZBLL Master Dataset
 * Encompasses all 7 Sets: T (72), U (72), L (72), H (40), Pi (72), S (72), AS (72)
 */

import { ZBLL_T_CASES, ZBLL_T_GROUPS, ZBLL_T_VIDEO_PATH } from './zbllTCases';
import { ZBLL_U_CASES, ZBLL_U_GROUPS, ZBLL_U_VIDEO_PATH } from './zbll/zbll_u';
import { ZBLL_L_CASES, ZBLL_L_GROUPS, ZBLL_L_VIDEO_PATH } from './zbll/zbll_l';
import { ZBLL_H_CASES, ZBLL_H_GROUPS, ZBLL_H_VIDEO_PATH } from './zbll/zbll_h';
import { ZBLL_PI_CASES, ZBLL_PI_GROUPS, ZBLL_PI_VIDEO_PATH } from './zbll/zbll_pi';
import { ZBLL_S_CASES, ZBLL_S_GROUPS, ZBLL_S_VIDEO_PATH } from './zbll/zbll_s';
import { ZBLL_AS_CASES, ZBLL_AS_GROUPS, ZBLL_AS_VIDEO_PATH } from './zbll/zbll_as';

export {
  ZBLL_T_CASES, ZBLL_T_GROUPS, ZBLL_T_VIDEO_PATH,
  ZBLL_U_CASES, ZBLL_U_GROUPS, ZBLL_U_VIDEO_PATH,
  ZBLL_L_CASES, ZBLL_L_GROUPS, ZBLL_L_VIDEO_PATH,
  ZBLL_H_CASES, ZBLL_H_GROUPS, ZBLL_H_VIDEO_PATH,
  ZBLL_PI_CASES, ZBLL_PI_GROUPS, ZBLL_PI_VIDEO_PATH,
  ZBLL_S_CASES, ZBLL_S_GROUPS, ZBLL_S_VIDEO_PATH,
  ZBLL_AS_CASES, ZBLL_AS_GROUPS, ZBLL_AS_VIDEO_PATH
};

export const ZBLL_SETS = {
  t: {
    id: 't',
    label: 'T',
    name: 'ZBLL Set T',
    cases: ZBLL_T_CASES,
    groups: ZBLL_T_GROUPS,
    videoPath: ZBLL_T_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_zbll_t_v1',
    filterTitle: 'SET T',
    filterSubtitle: '(6 GROUPS · 72 CASES)',
    allTitle: 'ALL 72 ZBLL SET-T CASES',
    allDesc: '',
    allLiteral: ''
  },
  u: {
    id: 'u',
    label: 'U',
    name: 'ZBLL Set U',
    cases: ZBLL_U_CASES,
    groups: ZBLL_U_GROUPS,
    videoPath: ZBLL_U_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_zbll_u_v1',
    filterTitle: 'SET U',
    filterSubtitle: '(6 GROUPS · 72 CASES)',
    allTitle: 'ALL 72 ZBLL SET-U CASES',
    allDesc: '',
    allLiteral: ''
  },
  l: {
    id: 'l',
    label: 'L',
    name: 'ZBLL Set L',
    cases: ZBLL_L_CASES,
    groups: ZBLL_L_GROUPS,
    videoPath: ZBLL_L_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_zbll_l_v1',
    filterTitle: 'SET L',
    filterSubtitle: '(6 GROUPS · 72 CASES)',
    allTitle: 'ALL 72 ZBLL SET-L CASES',
    allDesc: '',
    allLiteral: ''
  },
  h: {
    id: 'h',
    label: 'H',
    name: 'ZBLL Set H',
    cases: ZBLL_H_CASES,
    groups: ZBLL_H_GROUPS,
    videoPath: ZBLL_H_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_zbll_h_v1',
    filterTitle: 'SET H',
    filterSubtitle: '(4 GROUPS · 40 CASES)',
    allTitle: 'ALL 40 ZBLL SET-H CASES',
    allDesc: '',
    allLiteral: ''
  },
  pi: {
    id: 'pi',
    label: 'Pi',
    name: 'ZBLL Set Pi',
    cases: ZBLL_PI_CASES,
    groups: ZBLL_PI_GROUPS,
    videoPath: ZBLL_PI_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_zbll_pi_v1',
    filterTitle: 'SET Pi',
    filterSubtitle: '(6 GROUPS · 72 CASES)',
    allTitle: 'ALL 72 ZBLL SET-PI CASES',
    allDesc: '',
    allLiteral: ''
  },
  s: {
    id: 's',
    label: 'S',
    name: 'ZBLL Set S',
    cases: ZBLL_S_CASES,
    groups: ZBLL_S_GROUPS,
    videoPath: ZBLL_S_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_zbll_s_v1',
    filterTitle: 'SET S',
    filterSubtitle: '(6 GROUPS · 72 CASES)',
    allTitle: 'ALL 72 ZBLL SET-S CASES',
    allDesc: '',
    allLiteral: ''
  },
  as: {
    id: 'as',
    label: 'AS',
    name: 'ZBLL Set AS',
    cases: ZBLL_AS_CASES,
    groups: ZBLL_AS_GROUPS,
    videoPath: ZBLL_AS_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_zbll_as_v1',
    filterTitle: 'SET AS',
    filterSubtitle: '(6 GROUPS · 72 CASES)',
    allTitle: 'ALL 72 ZBLL SET-AS CASES',
    allDesc: '',
    allLiteral: ''
  }
};

