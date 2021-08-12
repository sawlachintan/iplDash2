import pandas as pd
from geopy.extra.rate_limiter import RateLimiter
from geopy.geocoders import Nominatim


path = 'https://sawlachintan.github.io/cricket_data/'
# runs and city processing
innings_df = pd.read_csv(path + 'ipl_data/innings_df.csv')
info_df = pd.read_csv(path + 'ipl_data/info_df.csv')

# grouping and aggregating runs from every match
runs_city = innings_df.copy(deep=True).groupby(
    ['key_id', 'innings_no', 'team']).agg({'runs_total': 'sum'}).reset_index()
runs_city = runs_city.join(
    info_df[['key_id', 'city']].set_index('key_id'), on='key_id')
runs_city['city'] = runs_city.city.replace('Bengaluru', 'Bangalore')

new_df = runs_city.groupby(['team', 'city']).agg(
    {'runs_total': 'sum'}).reset_index()

final_df = pd.pivot_table(new_df, values='runs_total',
                          index='city', columns='team', fill_value=0)
team_set = set(final_df.columns)

abb_dict = dict()
for team in team_set:
    if team == 'Delhi Capitals':
        abb_dict[team] = 'delhi'
    elif team == 'Deccan Chargers':
        abb_dict[team] = 'deccan'
    elif team == 'Punjab Kings':
        abb_dict[team] = 'pbks'
    elif team == 'Sunrisers Hyderabad':
        abb_dict[team] = 'srh'
    else:
        abb_dict[team] = ''.join([y[0] for y in team.split()]).lower()

final_df = final_df.rename(columns=abb_dict)
final_df.columns = list(final_df.columns)
final_df = final_df.reset_index()

locator = Nominatim(user_agent='myApp')
geocode = RateLimiter(locator.geocode, min_delay_seconds=1)

final_df['new_address'] = final_df['city'].apply(geocode)
final_df['point'] = final_df['new_address'].apply(
    lambda x: tuple(x.point) if x else None)
final_df[['lat', 'lon', 'altitude']] = pd.DataFrame(
    final_df['point'].tolist(), index=final_df.index)
final_df = final_df.drop(columns=['new_address', 'point', 'altitude'])

# win percentage
outcome_df = pd.read_csv(path + 'ipl_data/outcome_df.csv')
team_df = pd.read_csv(path + 'ipl_data/team_df.csv')

team_list = list(team_df.teams.unique())


win_percent = pd.DataFrame(columns=['team', 'matches', 'win'])

win_percent['matches'] = win_percent['team'].apply(
    lambda x: team_df[team_df.teams == x].shape[0])
win_percent['win'] = win_percent['team'].apply(
    lambda x: outcome_df[outcome_df.winner == x].shape[0])

win_percent['win_perc'] = round(
    win_percent['win'] / win_percent['matches'] * 100, 2)

win_percent['abb'] = win_percent['team'].apply(
    lambda x: ''.join([y[0] for y in x.split()]).lower())
win_percent.loc[win_percent.team == 'Sunrisers Hyderabad', 'abb'] = 'srh'
win_percent.loc[win_percent.team == 'Delhi Capitals', 'abb'] = 'delhi'
win_percent.loc[win_percent.team == 'Deccan Chargers', 'abb'] = 'deccan'
win_percent.loc[win_percent.team == 'Punjab Kings', 'abb'] = 'pbks'
win_percent = win_percent[['team', 'abb', 'win_perc']]
