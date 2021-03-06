from soccersimulator import SoccerTeam, Simulation, SoccerTournament, dump_jsonz, load_jsonz#, show_simu
from profAI import RandomStrategy,FonceurStrategy,FonceurTestStrategy,DefenseurStrategy,get_team
from profAI import strategies as st
from celery import Celery
import random as random
import sys
sys.path.append('../..')
from extractData.fileExtract import get_features_y

# Last hit Class (permet de savoir qui a tapé la balle en dernier)
class LastHit():
    def __init__(self) :
        self.LH = (0,0)
    def update(self, key) :
        self.LH = key
    def reset(self) :
        self.LH = (0,0)
    
celery_app = Celery('tasks', backend='amqp://guest:guest@rabbit:5672', broker='amqp://guest:guest@rabbit:5672')

celery_app.conf.update(
    CELERY_ROUTES = {"create_match": {"queue": "create_match"}},
)



@celery_app.task
def create_match(max_steps=1000):
    # Affichage d'initialisation
    print("IN CREATION")
    
    features, y = get_features_y(filename='../../extractData/order.txt')


    lh = LastHit()
    knn = st.KNNStrategy(features, y, 4,lastHit=lh, same_strat_step=1)
    knn.fit_model()

    # svm = st.SVMStrategy(features, y, lh)
    # svm.fit_model()
    
    randomForest = st.ForestClassifierStrategy('randomForest', features, y, lh, max_depth=6, criterion='entropy', class_weight='balanced')
    randomForest.fit_model()

    # Création de la variable Last Hit
    start = [st.ForwardStrategy(lh), st.DefenseurStrategy(lh)]
    # Création de l'équipe 1
    thon = SoccerTeam(name="Team 1")
    thon.add("PyPlayer",RandomStrategy) 
    thon.add("PyPlayer",RandomStrategy)
    thon.add("PyPlayer",RandomStrategy)
    thon.add("PyPlayer",RandomStrategy)

    # Création de l'équipe 2
    thon2 = SoccerTeam(name="Team 2")
    thon2.add("PyPlayer",knn) 
    thon2.add("PyPlayer",knn) 
    thon2.add("PyPlayer",knn) 
    thon2.add("PyPlayer",knn) 

    # Création du nom du fichier
    filename = str(random.random()*100000000)

    #Creation d'une partie
    simu = Simulation(thon2, thon, max_steps=max_steps, savefile=True, filename=filename, lasthit=lh)

    #Jouer et afficher la partie
    simu.start()
    # show_simu(simu)
    
    # On retourne le nom du fichier correspondant au match venant d'être simulé
    print(filename)
    return filename



# create_match()
# Match test pour les strategies
# max_steps=200

# features, y = get_features_y(filename='../../extractData/order.txt')


# lh = LastHit()
# knn = st.KNNStrategy(features, y, 4,lh, same_strat_step=1)
# knn.fit_model()

# start = [st.ForwardStrategy(lh), st.DefenseurStrategy(lh)]
# # Création de l'équipe 1
# pyteam = get_team(1)
# thon = SoccerTeam(name="Team 1")
# # thon.add("PyPlayer",st.DefenseurStrategy(lh))
# thon.add("PyPlayer",knn)

# # Création de l'équipe 2
# thon2 = SoccerTeam(name="Team 2")
# thon2.add("PyPlayer",st.ForwardStrategy(lh)) 
# # thon2.add("PyPlayer",knn) 

# #Creation d'une partie
# simu = Simulation(thon,thon2,max_steps=max_steps, lasthit=lh)
# #Jouer et afficher la partie
# simu.start()
# show_simu(simu)