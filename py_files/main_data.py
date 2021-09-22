import pandas as pd

innings_df = pd.read_csv(
    'https://sawlachintan.github.io/cricket_data/ipl_data/innings_df.csv')
info_df = pd.read_csv('https://sawlachintan.github.io/cricket_data/ipl_data/info_df.csv')[
    ['key_id', 'date', 'city', 'venue']]
info_df['city'] = info_df.city.replace('Bengaluru', 'Bangalore')

info_df['date'] = pd.to_datetime(info_df['date']).dt.strftime("%Y")
innings_df = innings_df.merge(info_df, on='key_id')
innings_df = innings_df.rename(columns={'date': 'year'})

print('Fetched Data')

team_df = pd.read_csv(
    'https://sawlachintan.github.io/cricket_data/ipl_data/team_df.csv')
innings_df['bowling_team'] = 'random'

match_set = set(innings_df['key_id'])
for match in match_set:
    match_df = innings_df.loc[innings_df.key_id == match, [
        'key_id', 'innings_no', 'team']].copy(deep=True)
    match_team_df = team_df[team_df.key_id == match].copy(deep=True)
    innings_num = set(match_df['innings_no'])
    for inning in innings_num:
        batting_team = match_df.loc[match_df.innings_no ==
                                    inning, 'team'].iloc[0]
        if batting_team == match_team_df.iloc[0, 1]:
            innings_df.loc[(innings_df.key_id == match) & (
                innings_df.innings_no == inning), 'bowling_team'] = match_team_df.iloc[1, 1]
        else:
            innings_df.loc[(innings_df.key_id == match) & (
                innings_df.innings_no == inning), 'bowling_team'] = match_team_df.iloc[0, 1]

print('Processed Bowling team')

runs_city = innings_df.groupby(['team', 'year', 'city']).agg(
    {'runs_total': 'sum'}).reset_index()

print('Processed Total Runs scored')

sixes_city = innings_df[innings_df.runs_batter == 6].groupby(
    ['team', 'year', 'city']).agg({'runs_batter': 'count'}).reset_index()
sixes_city = sixes_city.rename(columns={'runs_batter': 'sixes'})

print('Processed Total Sixes hit')

fours_city = innings_df[innings_df.runs_batter == 4].groupby(
    ['team', 'year', 'city']).agg({'runs_batter': 'count'}).reset_index()
fours_city = fours_city.rename(columns={'runs_batter': 'fours'})

print('Processed Total Fours hit')

temp_two_hundreds = innings_df.groupby(
    ['key_id', 'innings_no', 'team', 'year', 'city']).agg({'runs_total': 'sum'}).reset_index()
two_hundreds = temp_two_hundreds[temp_two_hundreds.runs_total >= 200].groupby(
    ['team', 'year', 'city']).agg({'runs_total': 'count'}).reset_index()
two_hundreds = two_hundreds.rename(columns={'runs_total': 'two_hundreds'})

print('Processed Total 200s scored')

temp_ten_wickets = innings_df[innings_df.wicket_kind.notna()].groupby(
    ['key_id', 'innings_no', 'bowling_team', 'year', 'city']).agg({'team': 'count'}).reset_index()
ten_wickets = temp_ten_wickets[temp_ten_wickets.team == 10].groupby(
    ['bowling_team', 'year', 'city']).agg({'team': 'count'}).reset_index()
ten_wickets = ten_wickets.rename(
    columns={'team': 'ten_wickets', 'bowling_team': 'team'})

print('Processed Total All Outs made')

temp_wickets = innings_df[innings_df.wicket_kind.notna()].groupby(
    ['key_id', 'innings_no', 'bowling_team', 'year', 'city']).agg({'team': 'count'}).reset_index()
wickets = temp_wickets.groupby(['bowling_team', 'year', 'city']).agg({
    'team': 'sum'}).reset_index()
wickets = wickets.rename(columns={'team': 'wickets', 'bowling_team': 'team'})

print('Processed Total Wickets taken')

matches_played = pd.merge(team_df, info_df, on='key_id', how='left')
matches_played = matches_played.rename(columns={'date': 'year'})
matches_played = matches_played.groupby(['teams', 'year', 'city']).agg({
    'key_id': 'count'}).reset_index()
matches_played = matches_played.rename(
    columns={'teams': 'team', 'key_id': 'matches'})

print('Processed Total Matches played')

outcome_df = pd.read_csv(
    'https://sawlachintan.github.io/cricket_data/ipl_data/outcome_df.csv')[['key_id', 'winner']]
wins = pd.merge(outcome_df, info_df, on='key_id', how='left')
wins = wins.rename(columns={'date': 'year'})
wins = wins.groupby(['winner', 'year', 'city']).agg(
    {'key_id': 'count'}).reset_index()
wins = wins.rename(columns={'winner': 'team', 'key_id': 'wins'})

print('Processed Total Wins secured')

toss_df = pd.read_csv(
    'https://sawlachintan.github.io/cricket_data/ipl_data/toss_df.csv')[['key_id', 'winner']]
toss_wins = pd.merge(toss_df, info_df, on='key_id', how='left')
toss_wins = toss_wins.rename(columns={'winner': 'team', 'date': 'year'})
toss_wins = toss_wins.groupby(['team', 'year', 'city']).agg(
    {'key_id': 'count'}).reset_index()
toss_wins = toss_wins.rename(columns={'key_id': 'toss_wins'})

print('Processed Total Toss Wins')

temp_output = pd.merge(matches_played, runs_city, on=[
                       'team', 'year', 'city'], how='left')
temp_output = pd.merge(temp_output, fours_city, on=[
                       'team', 'year', 'city'], how='left')
temp_output = pd.merge(temp_output, sixes_city, on=[
                       'team', 'year', 'city'], how='left')
temp_output = pd.merge(temp_output, two_hundreds, on=[
                       'team', 'year', 'city'], how='left')
temp_output = pd.merge(temp_output, ten_wickets, on=[
                       'team', 'year', 'city'], how='left')
temp_output = pd.merge(temp_output, wickets, on=[
                       'team', 'year', 'city'], how='left')
temp_output = pd.merge(temp_output, wins, on=[
                       'team', 'year', 'city'], how='left')
temp_output = pd.merge(temp_output, toss_wins, on=[
                       'team', 'year', 'city'], how='left')
temp_output = temp_output.fillna(0)
temp_output = temp_output.astype({'sixes': 'int32',
                                  'fours': 'int32',
                                  'year': 'int32',
                                  'runs_total': 'int32',
                                  'two_hundreds': 'int32',
                                  'ten_wickets': 'int32',
                                  'wickets': 'int32',
                                  'wins': 'int32',
                                  'toss_wins': 'int32'})

teams = set(temp_output['team'])
temp_output['abb'] = 'random'
for team in teams:
    if team == 'Delhi Capitals':
        temp_output.loc[temp_output.team == team, 'abb'] = 'delhi'
    elif team == 'Deccan Chargers':
        temp_output.loc[temp_output.team == team, 'abb'] = 'deccan'
    elif team == 'Sunrisers Hyderabad':
        temp_output.loc[temp_output.team == team, 'abb'] = 'srh'
    elif team == 'Punjab Kings':
        temp_output.loc[temp_output.team == team, 'abb'] = 'pbks'
    else:
        abbrev = team.lower().split(" ")
        new_abbrev = [x[0] for x in abbrev]
        temp_output.loc[temp_output.team == team, 'abb'] = ''.join(new_abbrev)

temp_output = temp_output.rename(columns={'runs_total': 'runs'})

temp_output.to_csv('./data/main_data.csv', index=False)

print('Updated csv file')
