'use client';

import React from 'react';
import { EngineeringBoardWorkbench } from './EngineeringBoardWorkbench';

/**
 * Historical compatibility export.
 *
 * The old BoardDesigner implementation duplicated PCB navigation, autoroute,
 * inspector, DRC and board-selection behavior. All live and compatibility
 * routes now converge on the authoritative EngineeringBoardWorkbench so there
 * is only one PCB mutation/rules path to qualify.
 */
export const BoardDesigner: React.FC = () => <EngineeringBoardWorkbench />;
