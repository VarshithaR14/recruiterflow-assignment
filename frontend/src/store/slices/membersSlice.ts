import { createSlice } from '@reduxjs/toolkit';

import { sampleMembers } from '../../data/sample-data';

const membersSlice = createSlice({
  name: 'members',
  initialState: sampleMembers,
  reducers: {},
});

export default membersSlice.reducer;