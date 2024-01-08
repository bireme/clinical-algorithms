from sqlalchemy import Column, ForeignKey, DATE, TEXT, VARCHAR, BIGINT, Enum, BOOLEAN
from app.db import Base
from .models_enums import (RecommendationType,
                           InterventionType,
                           NodesTypes,
                           Strength,
                           Direction,
                           Certainty)


class Algorithms(Base):
    __tablename__ = "algorithms"
    id = Column(BIGINT, primary_key=True)
    title = Column(VARCHAR(255), index=True)
    description = Column(TEXT)
    version = Column(VARCHAR(10))
    updated_at = Column(DATE)


class AlgorithmsCategories(Base):
    __tablename__ = "categories"
    id = Column(BIGINT, primary_key=True)
    name = Column(VARCHAR(255))
    updated_at = Column(DATE)


class AlgorithmsCategoriesRelated(Base):
    __tablename__ = "algorithms_categories"
    id = Column(BIGINT, primary_key=True)
    algorithm_id = Column(
        BIGINT,
        ForeignKey("algorithms.id"),
        nullable=False
    )
    category_id = Column(
        BIGINT,
        ForeignKey("categories.id"),
        nullable=False
    )
    updated_at = Column(DATE)


class AlgorithmsGraphs(Base):
    __tablename__ = "graphs"
    id = Column(BIGINT, primary_key=True)
    algorithm_id = Column(
        BIGINT,
        ForeignKey("algorithms.id"),
        nullable=False
    )
    graph = Column(TEXT)
    updated_at = Column(DATE)


class AlgorithmsNodes(Base):
    __tablename__ = "nodes"
    id = Column(BIGINT, primary_key=True)
    algorithm_id = Column(
        BIGINT,
        ForeignKey("algorithms.id"),
        nullable=False
    )
    node_id = Column(VARCHAR(255), nullable=False)
    node_type = Column(Enum(NodesTypes), nullable=False)
    label = Column(VARCHAR(255))
    updated_at = Column(DATE)


class AlgorithmsNodesRecommendations(Base):
    __tablename__ = "recommendations"
    id = Column(BIGINT, primary_key=True)
    node_id = Column(
        BIGINT,
        ForeignKey("nodes.id"),
        nullable=False
    )
    index = Column(BIGINT, nullable=False)
    recommendation_type = Column(Enum(RecommendationType), nullable=False)
    description = Column(TEXT)
    intervention_type = Column(Enum(InterventionType), nullable=False)
    intervention = Column(VARCHAR(255), index=True)
    comparator = Column(VARCHAR(255), index=True)
    direction = Column(Enum(Direction), nullable=False)
    strength = Column(Enum(Strength), nullable=False)
    certainty_of_the_evidence = Column(Enum(Certainty), nullable=False)
    implementation_considerations = Column(TEXT)
    additional_comments = Column(TEXT)
    recommendation_source = Column(TEXT)
    updated_at = Column(DATE)


class AlgorithmsNodesRecommendationsLinks(Base):
    __tablename__ = "links"
    id = Column(BIGINT, primary_key=True)
    recommendation_id = Column(
        BIGINT,
        ForeignKey("recommendations.id"),
        nullable=False
    )
    url = Column(VARCHAR(255), index=True)
    type = Column(Enum(Certainty), nullable=False)


class Users(Base):
    __tablename__ = "users"
    id = Column(BIGINT, primary_key=True)
    name = Column(VARCHAR(255), index=True, nullable=False)
    email = Column(VARCHAR(255), index=True, nullable=False)
    password = Column(VARCHAR(255), nullable=False)
    phone = Column(VARCHAR(255))
    maintainer = Column(BOOLEAN)
    master = Column(BOOLEAN)
    updated_at = Column(DATE, nullable=False)
