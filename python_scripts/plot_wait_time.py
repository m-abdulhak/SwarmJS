#! /usr/bin/env python
"""
Plot the pick-up and deposit functions from "The dynamics of collective sorting
robot-like ants and ant-like robots" by Deneubourg et al, 1990.
"""
import numpy as np
import matplotlib.pyplot as plt

w_max = 100 
x_start = 0.5
thetas = [i for i in np.arange(0, 0.01, 0.001)]

# Scaled Temperature
x = np.linspace(x_start, 1)

plt.subplot(111);

for theta in thetas:
    WaitTime = w_max * (x-x_start)**2 / ((x-x_start)**2 + theta) 
    plt.plot(x, WaitTime, label=theta);
    #plt.xlabel('Size of Candidate Cluster')
    plt.xlabel('Scaled Temperature')
    plt.ylabel('Wait Time')
    #plt.vlines(k1, 0, 1, linestyles='dashed');
    #plt.text(2, 0.5, r'$p_{pu} = \left( \frac{k_1}{k_1 + size} \right)^2$', fontsize=30)
    #plt.text(5, 0.5, r'$p_{pu} = \left( \frac{k_1}{k_1 + density} \right)^2$', fontsize=30)

plt.legend()
plt.show()
