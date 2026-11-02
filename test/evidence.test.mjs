import {test} from 'node:test';
import assert from 'node:assert/strict';
import {editEvidence} from '../public/evidence.js';
const evidence=[{id:'s_1',choice_id:'present',source:'initial'},{id:'s_2',choice_id:'absent',source:'initial'},{id:'s_3',choice_id:'present'},{id:'s_4',choice_id:'unknown'}];
test('editing an initial observation discards all question answers',()=>{const next=editEvidence(evidence,0,'absent');assert.deepEqual(next.evidence.map(e=>[e.id,e.choice_id]),[['s_1','absent'],['s_2','absent']]);assert.equal(next.count,0);assert.equal(evidence[0].choice_id,'present')});
test('editing an answer discards subsequent answers and keeps the count',()=>{const next=editEvidence(evidence,2,'unknown');assert.deepEqual(next.evidence.map(e=>e.id),['s_1','s_2','s_3']);assert.equal(next.evidence[2].choice_id,'unknown');assert.equal(next.count,1)});
test('removing an answer removes it and later answers',()=>{const next=editEvidence(evidence,2,'remove');assert.deepEqual(next.evidence.map(e=>e.id),['s_1','s_2']);assert.equal(next.count,0)});
